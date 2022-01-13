<script>
	import Button from './Button.svelte';
	let dark = false;

	function handleSubmit() {
		dark = !dark;
	}

	let lefts = [];
	let durations = [];
	let sizes = [];
	let delays = [];
	let colors = [];
	let available_colors = [
		'#2D7DD2',
		'#97CC04',
		'#ECB0E1',
		'#F95738'
	];
	for (let i = 0; i < 22; i++) {
		lefts.push(Math.floor(Math.random() * screen.width) + 'px');
		sizes.push(Math.floor(Math.random() * 100 + 50) + 'px');
		durations.push((Math.random() * 2 + 2) + 's');
		delays.push((Math.random() * 2) + 's');
		colors.push(available_colors[Math.floor(Math.random() * 4)]);
	}

</script>

<svelte:head>
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</svelte:head>

<main>

	{ #each Array(21) as _, i }
		<div class="box" style="--left: {lefts[i]}; --color: {colors[i]}; --duration: {durations[i]}; --delay: {delays[i]}; --size: {sizes[i]}"></div>
	{ /each }

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
			<div class="mobile-toggle-darkmode">
				<Button bind:value={dark} on:submit={handleSubmit}>
					{#if dark }
						<i class="material-icons">light_mode</i>
					{:else }
						<i class="material-icons">nightlight</i>
					{/if}
				</Button>
			</div>
			<a href="https://github.com/timrekelj"><img src="icons/github.svg" alt="github" height="50px"></a>
			<a href="https://www.instagram.com/timrekelj/"><img src="icons/instagram.svg" alt="instagram" height="50px"></a>
			<a href="https://twitter.com/timrekelj"><img src="icons/twitter.svg" alt="twitter" height="50px"></a>
			<a href="https://open.spotify.com/user/9nksd7kzg4meppj2r4kg6cldg?si=fce19c5d8fb34c31"><img src="icons/spotify.svg" alt="spotify" height="50px"></a>
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

	.box {
		top: -160px;
		z-index: -1;
		position: absolute;
		border-radius: 10px;
		animation-name: anime;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		width: var(--size);
		height: var(--size);
		animation-duration: var(--duration);
		background-color: var(--color);
		animation-delay: var(--delay);
		left: var(--left);

	}

	.toggle-darkmode {
		position: absolute;
		top: 40px;
		right: 40px;
	}

	.title-box {
		background-color: #282627;
		width: 800px;
		height: 250px;
		display: flex;
		justify-content: center;
		box-shadow: 0 0 40px #282627;
		border-radius: 10px;
		padding: 20px;
	}

	.center-help {
		padding: 0;
		margin: auto 0;
	}

	.footer {
		position: absolute;
		height: 90px;
		bottom: 40px;
		width: 90%;
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
	.mobile-toggle-darkmode {
		float: left;
		visibility: hidden;
		width: 0;
	}

	:global(body) {
		background-color: #EEF0F2;
		transition: background-color 0.3s
	}
	:global(body.dark-mode) {
		background-color: #5F5D5E;
	}

	@media (max-width: 900px) {
		.quote {
			visibility: hidden;
			width: 0;
		}
		.icons {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.toggle-darkmode {
			visibility: hidden;
		}
		.title-box {
			width: 90%;
			font-size: .7em;
		}
		.mobile-toggle-darkmode {
			visibility: visible;
			width: 70px;
		}
		
		.footer {
			bottom: 10px;
			width: 85%;
		}

		img {
			width: 40px;
		}

		i {
			width: 40px;
		}
	}

	@keyframes anime {
		from { top: -150px; }
		to { top: 2000px; }
	}
</style>