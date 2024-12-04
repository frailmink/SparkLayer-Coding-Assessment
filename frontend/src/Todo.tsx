import React from 'react';
import './App.css';

export type TodoType = {
  id: string,
  title: string,
  description: string,
  completed: boolean,
  onToggle: () => void
}

function Todo({ title, description, completed, onToggle }: TodoType) {
  const handleChange = () => {
    onToggle();  // This will toggle the completed state
  };

  return (
    <div className="todo">
      <div className="todo-details">
        <p className="todo-title">{title}</p>
        <p className="todo-description">{description}</p>
        <input className="todo-completed" type="checkbox" onChange={handleChange} checked={completed}></input>
      </div>
    </div>
  );
}

export default Todo;
