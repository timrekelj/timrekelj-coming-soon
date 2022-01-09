<script>
	import Button from './Button.svelte';
	let dark = false;

	function handleSubmit() {
		dark = !dark;
	}

</script>

<svelte:head>
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</svelte:head>

<main>
	<div class="toggle-darkmode">

		<Button bind:value={dark} on:submit={handleSubmit}>

			{#if dark }
				<i class="material-icons">light_mode</i>
			{:else }
				<i class="material-icons">nightlight</i>
			{/if}

		</Button>
	</div>
	<div class="title-box">
		<div class="center-help">
			<h1>"Website comming soon"</h1>
			<p>~ Tim Rekelj, 2022</p>
		</div>
	</div>
	<div class="footer">
		<div class="quote">"Bears, beets, battlestar galactica"</div>
		<div class="icons">
			<img src="icons/github.svg" alt="github" height="50px">
			<img src="icons/instagram.svg" alt="instagram" height="50px">
			<img src="icons/twitter.svg" alt="twitter" height="50px">
			<img src="icons/spotify.svg" alt="spotify" height="50px">
		</div>
	</div>
</main>

<style>
	main {
		height: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.toggle-darkmode {
		position: absolute;
		top: 40px;
		right: 40px;
	}

	.title-box {
		background-color: #282627;
		width: 800px;
		height: 300px;
		display: flex;
		justify-content: center;
		box-shadow: 0 0 40px #282627;
		border-radius: 10px;
	}

	.center-help {
		padding: 0;
		margin: auto 0;
	}

	.footer {
		position: absolute;
		bottom: 40px;
		width: 93%;
		padding: 10px 20px;
		background-color: #282627;
		box-shadow: 0 0 40px #282627;
		border-radius: 10px;
		display: flex;
		align-items: center;
	}

	.quote {
		color: #EEF0F2;
		float: left;
		font-size: 1.5em;
	}

	.icons {
		margin: 0 0 0 auto;
		order: 2;
	}

	img {
		margin: 10px;
	}

	h1 {
		color: #EEF0F2;
		font-size: 4em;
		padding: 0;
		margin: 0;
	}

	p {
		color: #EEF0F2;
		padding: 0;
		margin: 0;
		float: right;
	}

	:global(body) {
		background-color: #EEF0F2;
		transition: background-color 0.3s
	}
	:global(body.dark-mode) {
		background-color: #403B3D;
	}

	@media (min-width: 940px) {
		main {
			max-width: none;
		}
	}
</style>