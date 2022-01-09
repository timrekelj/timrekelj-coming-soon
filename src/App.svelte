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

	<div class="box" style="--left: {lefts[0]}; --color: {colors[0]}; --duration: {durations[0]}; --delay: {delays[0]}; --size: {sizes[0]}"></div>
	<div class="box" style="--left: {lefts[1]}; --color: {colors[1]}; --duration: {durations[1]}; --delay: {delays[1]}; --size: {sizes[1]}"></div>
	<div class="box" style="--left: {lefts[2]}; --color: {colors[2]}; --duration: {durations[2]}; --delay: {delays[2]}; --size: {sizes[2]}"></div>
	<div class="box" style="--left: {lefts[3]}; --color: {colors[3]}; --duration: {durations[3]}; --delay: {delays[3]}; --size: {sizes[3]}"></div>
	<div class="box" style="--left: {lefts[4]}; --color: {colors[4]}; --duration: {durations[4]}; --delay: {delays[4]}; --size: {sizes[4]}"></div>
	<div class="box" style="--left: {lefts[5]}; --color: {colors[5]}; --duration: {durations[5]}; --delay: {delays[5]}; --size: {sizes[5]}"></div>
	<div class="box" style="--left: {lefts[6]}; --color: {colors[6]}; --duration: {durations[6]}; --delay: {delays[6]}; --size: {sizes[6]}"></div>
	<div class="box" style="--left: {lefts[7]}; --color: {colors[7]}; --duration: {durations[7]}; --delay: {delays[7]}; --size: {sizes[7]}"></div>
	<div class="box" style="--left: {lefts[8]}; --color: {colors[8]}; --duration: {durations[8]}; --delay: {delays[8]}; --size: {sizes[8]}"></div>
	<div class="box" style="--left: {lefts[9]}; --color: {colors[9]}; --duration: {durations[9]}; --delay: {delays[9]}; --size: {sizes[9]}"></div>
	<div class="box" style="--left: {lefts[10]}; --color: {colors[10]}; --duration: {durations[10]}; --delay: {delays[10]}; --size: {sizes[10]}"></div>
	<div class="box" style="--left: {lefts[11]}; --color: {colors[11]}; --duration: {durations[11]}; --delay: {delays[11]}; --size: {sizes[11]}"></div>
	<div class="box" style="--left: {lefts[12]}; --color: {colors[12]}; --duration: {durations[12]}; --delay: {delays[12]}; --size: {sizes[12]}"></div>
	<div class="box" style="--left: {lefts[13]}; --color: {colors[13]}; --duration: {durations[13]}; --delay: {delays[13]}; --size: {sizes[13]}"></div>
	<div class="box" style="--left: {lefts[14]}; --color: {colors[14]}; --duration: {durations[14]}; --delay: {delays[14]}; --size: {sizes[14]}"></div>
	<div class="box" style="--left: {lefts[15]}; --color: {colors[15]}; --duration: {durations[15]}; --delay: {delays[15]}; --size: {sizes[15]}"></div>
	<div class="box" style="--left: {lefts[16]}; --color: {colors[16]}; --duration: {durations[16]}; --delay: {delays[16]}; --size: {sizes[16]}"></div>
	<div class="box" style="--left: {lefts[17]}; --color: {colors[17]}; --duration: {durations[17]}; --delay: {delays[17]}; --size: {sizes[17]}"></div>
	<div class="box" style="--left: {lefts[18]}; --color: {colors[18]}; --duration: {durations[18]}; --delay: {delays[18]}; --size: {sizes[18]}"></div>
	<div class="box" style="--left: {lefts[19]}; --color: {colors[19]}; --duration: {durations[19]}; --delay: {delays[19]}; --size: {sizes[19]}"></div>
	<div class="box" style="--left: {lefts[20]}; --color: {colors[20]}; --duration: {durations[20]}; --delay: {delays[20]}; --size: {sizes[20]}"></div>
	<div class="box" style="--left: {lefts[21]}; --color: {colors[21]}; --duration: {durations[21]}; --delay: {delays[21]}; --size: {sizes[21]}"></div>

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
		}
		.mobile-toggle-darkmode {
			visibility: visible;
			width: 70px;
		}
	}

	@keyframes anime {
		from { top: -150px; }
		to { top: 2000px; }
	}
</style>