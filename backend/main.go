package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"github.com/google/uuid"
)

// Todo structure that will be used to represent a Todo item
type Todo struct {
	ID 			string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// InMemoryStore represents our in-memory database
type InMemoryStore struct {
	todos []Todo
	mu    sync.RWMutex
}

// store the Todos in the in-memory database
var store = &InMemoryStore{
	todos: make([]Todo, 0),
}

// function that will update the database with the new Todo item
func (s *InMemoryStore) AddTodo(todo Todo) {
	s.mu.Lock() // locks mutex associated with in-memory database to prevent concurrent access
	defer s.mu.Unlock() // unlocks the mutex once the function finishes
	todo.ID = uuid.New().String()
	s.todos = append(s.todos, todo)
}

// function that will return all the Todo items in the database
func (s *InMemoryStore) GetTodos() []Todo {
	s.mu.RLock() // locks mutex for reading that allows multiple go routines to read data as long as none is editting
	defer s.mu.RUnlock()
	return s.todos
}

func ToDoListHandler(w http.ResponseWriter, r *http.Request) {
	// set up Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// handles Get and POST requests
	switch r.Method {
	case "GET":
		// will return the Todo items
		todos := store.GetTodos()
		json.NewEncoder(w).Encode(todos)

	case "POST":
		// will recieve data of Todo item and store it in the database
		var todo Todo
		if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// validates required fields
		if todo.Title == "" || todo.Description == "" {
			http.Error(w, "title and description are required", http.StatusBadRequest)
			return
		}

		store.AddTodo(todo)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(todo)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/", ToDoListHandler)
	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}