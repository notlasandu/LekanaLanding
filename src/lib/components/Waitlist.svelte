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

<div class="flex w-full max-w-sm flex-col">
	<div class="flex w-full items-center rounded-full bg-neutral-950 text-sm text-white">
		<input
			id="email"
			name="email"
			type="email"
			bind:value={email}
			placeholder="you@company.com"
			class="w-full flex-1 rounded-full border-neutral-700 px-4 text-sm transition-all duration-200 outline-none md:px-8 py-3"
			required
		/>
		<div class="{loading ? 'glow-btn' : 'bg-neutral-800'} mr-0.5 flex w-fit rounded-full p-0.5">
			<button
				class="rounded-full bg-neutral-950 px-4 py-3 text-sm whitespace-nowrap shadow-lg transition-shadow duration-500 hover:shadow-green-500/50 md:px-6 md:py-4 md:text-base"
				onclick={submitToWaitlist}
			>
				Join Waitlist
			</button>
		</div>
	</div>
	<p class="mt-2 pl-6 text-xs text-white/70 md:text-sm">
		{message}
	</p>
</div>
