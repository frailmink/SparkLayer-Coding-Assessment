import React, { useEffect, useState } from 'react';
import './App.css';
import Todo, { TodoType } from './Todo';

function App() {
    const [todos, setTodos] = useState<TodoType[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchTodos();
    }, []);

    // function that calls server backend to recieve the Todo items
    const fetchTodos = async () => {
        try {
            const response = await fetch('http://localhost:8080/');
            if (!response.ok) {
                console.log('Error fetching data');
                return;
            }
            const data = await response.json();
            setTodos(data);
        } catch (e) {
            console.log('Could not connect to server. Ensure it is running. ' + e);
        }
    };

    // on each change of input in form saves the form data
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    // on submitting the form calls servers backend and updates the todo list
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            setError('Both title and description are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to add todo');
            }

            // resets form data
            setFormData({
                title: '',
                description: ''
            });
            await fetchTodos();
        } catch (e) {
            setError('Failed to add todo. Please try again.');
            console.error('Error:', e);
        }
    };

    const handleToggleTodo = async (id: string) => {
      try {
        const response = await fetch('http://localhost:8080/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update todo');
        }
  
        // Refresh todos list
        await fetchTodos();
      } catch (e) {
        console.error('Error updating todo:', e);
      }
    };

    // returns the Todos
    return (
        <div className="app">
            <header className="app-header">
                <h1>TODO</h1>
            </header>
            <div className="todo-list">
                {todos.map((todo) =>
                    <Todo
                        key={todo.id} // id added to prevent errors when submitting todos with same title and description as previous ones
                        {...todo}
                        onToggle={() => handleToggleTodo(todo.id)}
                    />
                )}
            </div>
            <h2>Add a Todo</h2>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                <input
                    placeholder="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    autoFocus={true}
                />
                <input
                    placeholder="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                />
                <button type="submit">Add Todo</button>
            </form>
        </div>
    );
}

export default App;