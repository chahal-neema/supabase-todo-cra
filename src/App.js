import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Component mounted');
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      console.log('Fetching todos...');
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Todos fetched:', data);
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask }])
        .select();

      if (error) throw error;
      setTodos([data[0], ...todos]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding todo:', error.message);
      setError(error.message);
    }
  }

  async function toggleTodo(id, is_completed) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !is_completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !is_completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error.message);
      setError(error.message);
    }
  }

  async function deleteTodo(id) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error.message);
      setError(error.message);
    }
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Todo List</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={addTodo} className="add-todo-form">
          <input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                />
                <span className={todo.is_completed ? 'completed' : ''}>
                  {todo.task}
                </span>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
