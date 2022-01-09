<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function toggle() {
        window.document.body.classList.toggle('dark-mode');
        dispatch('submit');
    }
</script>
<button on:click={toggle}>
    <slot/>
</button>
<style>
    button {
        background-color: #282627;
        color: #EEF0F2;
        border-radius: 10px;
        padding: 20px;
        border: none;
		box-shadow: 0 0 40px #282627;
        
    }
    :global(body.dark-mode) button {
        background-color: #282627;
        color: #EEF0F2;
    }
</style>