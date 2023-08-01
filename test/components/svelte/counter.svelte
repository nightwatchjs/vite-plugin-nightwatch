  <script>
    export let count;

    function increment() {
      count += 1;
    }
  </script>

  <main>
    <h1>Simple Counter</h1>
    <p>Count: {count}</p>
    <button on:click={increment}>Increment</button>
  </main>

  <style>
    main {
      text-align: center;
      padding: 2rem;
      font-family: Arial, sans-serif;
    }
    button {
      font-size: 1rem;
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
