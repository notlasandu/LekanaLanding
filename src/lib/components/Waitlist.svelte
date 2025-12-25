<script>
	let email = '';
	let message = '';
	let loading = false;

	async function submitToWaitlist() {
		loading = true;
		message = '';

		try {
			const response = await fetch('/api/waitlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const result = await response.json();

			if (!response.ok) {
				console.error('Error:', result);
				message = result?.error || 'Failed to submit. Please try again.';
				return;
			}

			message = 'Successfully submitted to the waitlist!';
		} catch (err) {
			console.error('Request failed:', err);
			message = 'Something went wrong. Please check your connection.';
		} finally {
			loading = false;
		}
	}
</script>
<div class="flex flex-col w-full max-w-sm">

	<div class="flex w-fit rounded-full bg-neutral-950 text-sm text-white">
		<input
		id="email"
		name="email"
		type="email"
		bind:value={email}
		placeholder="you@company.com"
		class=" rounded-full border-neutral-700 px-8 py-1 text-sm transition-all duration-200 outline-none md:py-2.5"
		required
		/>
	<div class="{loading?'glow-btn': 'bg-neutral-800'} flex w-fit rounded-full p-0.5">
		<button
			class="flex gap-2 rounded-full bg-neutral-950 px-6 py-2 shadow-lg transition-shadow duration-500 hover:shadow-green-500/50 md:py-4"
			onclick={submitToWaitlist}
		>
			Join Waitlist
		</button>
	</div>
</div>
<p class="mt-2 pl-6 text-sm text-white">
	{message}
</p>

</div>