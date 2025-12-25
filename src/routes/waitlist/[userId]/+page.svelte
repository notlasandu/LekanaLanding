<script>
	import { ArrowRight } from 'lucide-svelte';

	let { data } = $props();
	let email = $state(data?.email);
	let submitted = $state(data?.submitted);
	let loading = $state(false);
	let message = $state('');
	let agreeToContact = $state(false);

	// Step state
	let currentStep = $state(0);
	const steps = [
		{ title: 'About You', fields: ['name', 'company', 'role'] },
		{ title: 'Business Details', fields: ['industry', 'volume'] },
		{ title: 'Your Needs', fields: ['docs'] }
	];

	let formData = $state({
		name: '',
		company: '',
		contact: '',
		role: '',
		industry: '',
		industryOther: '', // New field for "Other" input
		volume: '',
		docs: ''
	});

	// Derived value for submission
	let finalIndustry = $derived(
		formData.industry === 'Other' ? formData.industryOther : formData.industry
	);

	function nextStep() {
		// Basic validation for current step
		const currentFields = steps[currentStep].fields;
		let valid = true;

		// Simple check: required fields must be filled
		// Note: 'contact' and 'role' are optional in original, but let's check basic required ones
		if (currentStep === 0) {
			if (!formData.name || !formData.company) valid = false;
		} else if (currentStep === 1) {
			if (!formData.industry || !formData.volume) valid = false;
			if (formData.industry === 'Other' && !formData.industryOther) valid = false;
		}

		if (valid) {
			currentStep++;
		} else {
			// Trigger browser validation UI
			const forms = document.querySelectorAll('form');
			if (forms[0] && !forms[0].checkValidity()) {
				forms[0].reportValidity();
				return;
			}
			// If browser thought it was valid (e.g. no 'required' on current inputs), progress.
			// But we manually checked above too. If manual check failed but browser didn't catch (e.g. hidden inputs?), stop.
			if (!valid && forms[0].checkValidity()) {
				// This shouldn't happen often if we use required attributes correctly
				message = 'Please fill in all required fields.';
				// Clear message after 3s
				setTimeout(() => (message = ''), 3000);
			} else {
				currentStep++;
			}
		}
	}

	function prevStep() {
		if (currentStep > 0) currentStep--;
	}

	async function submitToWaitlist() {
		if (!agreeToContact) {
			message = 'Please agree to be contacted to proceed.';
			return;
		}

		loading = true;
		message = '';

		try {
			const payload = {
				name: formData.name,
				company: formData.company,
				contact: formData.contact,
				role: formData.role,
				industry: finalIndustry,
				volume: formData.volume,
				workflows: formData.docs,
				agree: agreeToContact
			};

			const res = await fetch(`/api/waitlist/${data.userId}/profile`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const result = await res.json();

			if (!res.ok) {
				message = result.error || 'Failed to submit details. Please try again.';
			} else {
				submitted = true;
			}
		} catch (err) {
			console.error('Error submitting waitlist form:', err);
			message = 'An unexpected error occurred. Please try again later.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<meta name="theme-color" content="#05df72" />
</svelte:head>

<section
	id="waitlist"
	class="flex min-h-screen w-full flex-col items-center justify-center bg-neutral-950 px-4 py-16 text-white md:py-24"
>
	<div class="w-full max-w-2xl">
		<h2 class="text-center text-3xl font-semibold md:text-5xl">Welcome to Lekana</h2>
		<p class="mt-4 text-center text-sm text-gray-400 md:text-lg">
			Let's get your workspace set up.
		</p>

		{#if submitted}
			<div
				class="mt-12 flex flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900 p-12 text-center shadow-2xl"
			>
				<div class="mb-6 text-6xl">🎉</div>
				<h3 class="mb-3 text-3xl font-semibold text-green-500">You're all set!</h3>
				<p class="text-lg text-gray-300">
					We've received your details. Our team will reach out shortly.
				</p>

				<div class="mt-10 flex flex-col items-center gap-6">
					<div
						class="glow-btn flex rounded-full p-0.5 shadow-lg transition-shadow duration-500 hover:shadow-green-500/50"
					>
						<a
							href="/scan"
							class="flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition-colors duration-300"
						>
							Try Demo
							<ArrowRight size={18} />
						</a>
					</div>
					<a href="/" class="text-sm text-gray-400 transition-colors hover:text-white">
						Back to Home
					</a>
				</div>
			</div>
		{:else}
			<!-- Progress Bar -->
			<div class="mx-auto mt-10 mb-8 flex w-full max-w-xs items-center justify-center gap-2">
				{#each steps as step, i}
					<div
						class="h-1.5 w-full rounded-full transition-colors duration-300 {i <= currentStep
							? 'bg-green-500 shadow-md shadow-green-500/30'
							: 'bg-neutral-800'}"
					></div>
				{/each}
			</div>

			<div class="glow-btn relative mt-4 flex rounded-3xl p-0.5 shadow-2xl shadow-green-900/10">
				<form
					class="w-full rounded-3xl bg-neutral-900 p-6 md:p-10"
					onsubmit={(e) => e.preventDefault()}
				>
					<!-- Form Steps -->
					<div class="min-h-[300px]">
						<!-- STEP 1: About You -->
						{#if currentStep === 0}
							<div class="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
								<h3 class="mb-6 text-xl font-medium text-white">About You</h3>
								<div class="grid gap-6 md:grid-cols-2">
									<!-- Name -->
									<div class="flex flex-col text-sm">
										<label for="name" class="mb-2 font-medium text-gray-300"
											>Full Name <span class="text-red-500">*</span></label
										>
										<input
											id="name"
											name="name"
											type="text"
											bind:value={formData.name}
											placeholder="Alex Johnson"
											class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
											required
										/>
									</div>

									<!-- Company name -->
									<div class="flex flex-col text-sm">
										<label for="company" class="mb-2 font-medium text-gray-300"
											>Company Name <span class="text-red-500">*</span></label
										>
										<input
											id="company"
											name="company"
											type="text"
											bind:value={formData.company}
											placeholder="Acme Corp"
											class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
											required
										/>
									</div>

									<!-- Work email -->
									<div class="flex flex-col text-sm">
										<label for="email" class="mb-2 font-medium text-gray-300">Work Email</label>
										<input
											id="email"
											name="email"
											type="email"
											disabled
											bind:value={email}
											class="w-full cursor-not-allowed rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-gray-500 outline-none"
										/>
									</div>

									<!-- Role -->
									<div class="flex flex-col text-sm">
										<label for="role" class="mb-2 font-medium text-gray-300">Role</label>
										<input
											id="role"
											name="role"
											type="text"
											bind:value={formData.role}
											placeholder="e.g. CTO, Operations Lead"
											class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
										/>
									</div>

									<!-- Contact -->
									<div class="flex flex-col text-sm md:col-span-2">
										<label for="contact" class="mb-2 font-medium text-gray-300"
											>Phone Number <span class="ml-1 text-xs font-normal text-neutral-500"
												>(Optional)</span
											></label
										>
										<input
											id="contact"
											name="contact"
											type="tel"
											bind:value={formData.contact}
											placeholder="+1 555 000 0000"
											class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
										/>
									</div>
								</div>
							</div>
						{/if}

						<!-- STEP 2: Business Details -->
						{#if currentStep === 1}
							<div class="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
								<h3 class="mb-6 text-xl font-medium text-white">Business Details</h3>
								<div class="grid gap-6">
									<!-- Industry -->
									<div class="flex flex-col text-sm">
										<label for="industry" class="mb-2 font-medium text-gray-300"
											>Industry <span class="text-red-500">*</span></label
										>
										<select
											id="industry"
											name="industry"
											bind:value={formData.industry}
											class="w-full rounded-xl border border-neutral-800 bg-black px-4 py-3 text-sm transition-all duration-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
											required
										>
											<option value="" disabled selected>Select an industry</option>
											<option>Financial Services</option>
											<option>Healthcare</option>
											<option>Logistics & Supply Chain</option>
											<option>Legal & Compliance</option>
											<option>Real Estate</option>
											<option>Manufacturing</option>
											<option>Technology</option>
											<option>Other</option>
										</select>
									</div>

									{#if formData.industry === 'Other'}
										<div class="animate-in fade-in slide-in-from-top-2 flex flex-col text-sm">
											<label for="industryOther" class="mb-2 font-medium text-gray-300"
												>Please specify <span class="text-red-500">*</span></label
											>
											<input
												id="industryOther"
												name="industryOther"
												type="text"
												bind:value={formData.industryOther}
												placeholder="e.g. Education, Retail..."
												class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
												required
											/>
										</div>
									{/if}

									<!-- Document volume -->
									<div class="flex flex-col text-sm">
										<label for="volume" class="mb-2 font-medium text-gray-300"
											>Monthly Document Volume <span class="text-red-500">*</span></label
										>
										<select
											id="volume"
											name="documentVolume"
											bind:value={formData.volume}
											class="w-full rounded-xl border border-neutral-800 bg-black px-4 py-3 text-sm transition-all duration-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
											required
										>
											<option value="" disabled selected>Select a range</option>
											<option>&lt; 100</option>
											<option>100 – 500</option>
											<option>500 – 2,000</option>
											<option>2,000 – 10,000</option>
											<option>10,000+</option>
										</select>
									</div>
								</div>
							</div>
						{/if}

						<!-- STEP 3: Workflows & Consent -->
						{#if currentStep === 2}
							<div class="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
								<h3 class="mb-6 text-xl font-medium text-white">Final Details</h3>

								<!-- Workflows textarea -->
								<div class="flex flex-col text-sm">
									<label for="workflows" class="mb-2 font-medium text-gray-300">
										What workflows do you want to automate?
									</label>
									<textarea
										id="workflows"
										name="workflows"
										bind:value={formData.docs}
										rows="4"
										placeholder="e.g. Invoice processing, AP automation, Contract analysis..."
										class="w-full rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-sm transition-all duration-200 outline-none placeholder:text-neutral-600 focus:border-green-500 focus:ring-1 focus:ring-green-500"
									></textarea>
								</div>

								<!-- Checkbox -->
								<label
									class="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-800 bg-black/20 p-4 transition-colors hover:bg-black/40"
								>
									<input
										type="checkbox"
										name="consent"
										bind:checked={agreeToContact}
										class="mt-1 h-5 w-5 rounded border-neutral-600 bg-black/60 text-green-500 accent-green-500 outline-none focus:ring-1 focus:ring-green-500"
										required
									/>
									<span class="text-sm text-gray-400">
										I agree to be contacted by Lekana regarding my waitlist request and understand
										my information will be handled securely.
									</span>
								</label>
							</div>
						{/if}
					</div>

					<!-- Navigation Buttons -->
					<div class="mt-8 flex items-center justify-between border-t border-neutral-800 pt-6">
						<!-- Back Button -->
						<button
							type="button"
							class="text-sm font-medium text-gray-400 transition-colors hover:text-white disabled:opacity-0"
							onclick={prevStep}
							disabled={currentStep === 0}
						>
							&larr; Back
						</button>

						<!-- Error Message -->
						{#if message}
							<div class="absolute right-0 bottom-24 left-0 text-center">
								<span
									class="rounded-full border border-red-500/30 bg-red-900/80 px-4 py-2 text-xs font-medium text-red-100 backdrop-blur-sm"
								>
									{message}
								</span>
							</div>
						{/if}

						<!-- Next / Submit Button -->
						{#if currentStep < steps.length - 1}
							<button
								type="button"
								onclick={nextStep}
								class="rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gray-200 active:scale-95"
							>
								Next
							</button>
						{:else}
							<button
								onclick={submitToWaitlist}
								disabled={loading}
								type="button"
								class="flex items-center gap-2 rounded-full bg-green-500 px-8 py-2.5 text-sm font-semibold text-black transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if loading}
									<span>Processing...</span>
								{:else}
									<span>Complete Setup</span>
								{/if}
							</button>
						{/if}
					</div>
				</form>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Copying the glow effect from landing page */
	.glow-btn {
		background: linear-gradient(var(--gradient-angle), #05df72, rgba(167, 243, 208, 0), #05df72);
		animation: rotation 8s linear infinite;
	}

	@keyframes rotation {
		0% {
			--gradient-angle: 0deg;
		}
		100% {
			--gradient-angle: 360deg;
		}
	}
</style>
