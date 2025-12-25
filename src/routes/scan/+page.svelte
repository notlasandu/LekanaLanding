<script>
	import {
		CloudUpload,
		FileText,
		X,
		Loader2,
		CheckCircle,
		Sparkles,
		ArrowRight,
		Clock,
		Zap,
		Eye,
		Lock,
		Shield,
		LogOut,
		ArrowLeft
	} from 'lucide-svelte';
	import { SignIn, SignUp, SignedIn, SignedOut, SignOutButton } from 'svelte-clerk';
	import { useClerkContext } from 'svelte-clerk/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { stopPropagation } from 'svelte/legacy';
	import Waitlist from '$lib/components/Waitlist.svelte';

	const ctx = useClerkContext();

	let user = $state(ctx.auth.user);

	// Step management: 1 = upload, 2 = configure, 3 = auth/process, 4 = results
	let currentStep = $state(1);

	// Auth mode: 'signin' or 'signup'
	let authMode = $state('signup');

	// File handling
	let isDragging = $state(false);
	let files = $state([]);
	let fileNames = $state({}); // Custom names for files
	let savedFileData = $state([]); // Base64 encoded files for persistence

	// Processing state
	let isProcessing = $state(false);
	let error = $state('');

	// Results
	let results = $state(null);

	// File preview
	let previewUrl = $state(null);
	let previewName = $state('');

	// Restore data from localStorage on mount (for after Clerk redirect)
	onMount(() => {
		if (browser) {
			const savedData = localStorage.getItem('scanData');
			if (savedData) {
				try {
					const parsed = JSON.parse(savedData);
					fileNames = parsed.fileNames || {};
					savedFileData = parsed.savedFileData || [];
					currentStep = parsed.currentStep || 3;

					// Reconstruct File objects from base64 if we have saved data
					if (savedFileData.length > 0) {
						reconstructFilesFromBase64();
					}

					localStorage.removeItem('scanData');
				} catch (e) {
					console.error('Failed to restore saved data:', e);
				}
			}
		}
	});

	// Convert base64 back to File objects
	async function reconstructFilesFromBase64() {
		const reconstructedFiles = [];
		for (const fileData of savedFileData) {
			try {
				const response = await fetch(fileData.base64);
				const blob = await response.blob();
				const file = new File([blob], fileData.name, { type: fileData.type });
				reconstructedFiles.push(file);
			} catch (e) {
				console.error('Failed to reconstruct file:', e);
			}
		}
		files = reconstructedFiles;
	}

	// Convert files to base64 for storage
	async function filesToBase64() {
		const promises = files.map((file) => {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve({
						name: file.name,
						type: file.type,
						base64: reader.result
					});
				};
				reader.readAsDataURL(file);
			});
		});
		return Promise.all(promises);
	}

	// Save data before going to step 3 (auth)
	async function saveDataForRedirect() {
		if (browser) {
			const base64Files = await filesToBase64();
			const dataToSave = {
				fileNames,
				savedFileData: base64Files,
				currentStep: 3
			};
			try {
				localStorage.setItem('scanData', JSON.stringify(dataToSave));
			} catch (e) {
				// localStorage might be full for large files
				console.error('Failed to save data:', e);
			}
		}
	}

	function handleDragOver(event) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event) {
		event.preventDefault();
		isDragging = false;
		const droppedFiles = event.dataTransfer?.files;
		if (droppedFiles?.length) {
			addFiles([...droppedFiles]);
		}
	}

	function handleFileInput(event) {
		const selectedFiles = event.target?.files;
		if (selectedFiles?.length) {
			addFiles([...selectedFiles]);
		}
	}

	function addFiles(newFiles) {
		const validFiles = newFiles.filter((f) => /\.(pdf|png|jpg|jpeg|tiff|bmp)$/i.test(f.name));
		files = [...files, ...validFiles];
		validFiles.forEach((f) => {
			if (!fileNames[f.name]) {
				fileNames[f.name] = f.name.replace(/\.[^/.]+$/, '');
			}
		});
	}

	function removeFile(index) {
		const fileName = files[index].name;
		delete fileNames[fileName];
		files = files.filter((_, i) => i !== index);
		if (files.length === 0) {
			currentStep = 1;
		}
	}

	function triggerFileInput() {
		document.getElementById('file-input')?.click();
	}

	function goToStep2(event) {
		event.stopPropagation();
		if (files.length > 0) {
			currentStep = 2;
		}
	}

	async function goToStep3() {
		await saveDataForRedirect();
		currentStep = 3;
	}

	async function processFiles() {
		isProcessing = true;
		error = '';
		results = null;

		try {
			const formData = new FormData();
			files.forEach((f) => {
				formData.append('files', f);
			});
			formData.append('outputFormat', 'structured');
			formData.append('useDocumentAI', 'true');
			formData.append('useGemini', 'true');

			const response = await fetch('/api/scan', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to process documents');
			}

			results = data;
			currentStep = 4;
		} catch (err) {
			console.error('Processing error:', err);
			error = err.message || 'Something went wrong. Please try again.';
		} finally {
			isProcessing = false;
		}
	}

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function startOver() {
		files = [];
		fileNames = {};
		savedFileData = [];
		results = null;
		error = '';
		currentStep = 1;
	}

	function formatConfidence(confidence) {
		if (!confidence) return '';
		return Math.round(confidence * 100) + '%';
	}

	function getConfidenceBgColor(confidence) {
		if (!confidence) return 'bg-gray-800 text-gray-400';
		if (confidence >= 0.9) return 'bg-green-900/50 text-green-400 border-green-800';
		if (confidence >= 0.7) return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
		return 'bg-red-900/50 text-red-400 border-red-800';
	}

	function previewFile(index) {
		const file = files[index];
		if (file) {
			previewUrl = URL.createObjectURL(file);
			previewName = file.name;
		}
	}

	function closePreview() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = null;
		previewName = '';
	}

	// Progress calculation (1-4 steps)
	let progressPercent = $derived(currentStep === 4 ? 100 : ((currentStep - 1) / 3) * 100 + 10);
</script>

<svelte:head>
	<title>Free Document Scanner - Extract Data with AI | Lekana</title>
	<meta
		name="description"
		content="Try Lekana's free AI document scanner. Upload PDFs, images, or scans and instantly extract structured data. No credit card required."
	/>
	<meta
		name="keywords"
		content="OCR, document scanner, AI, data extraction, PDF scanner, invoice processing, free OCR, free Transcription, free AI Document Scanner"
	/>
	<meta property="og:title" content="Free AI Document Scanner | Lekana Demo" />
	<meta
		property="og:description"
		content="Upload any document and watch AI extract structured data in seconds. Try it free."
	/>
	<meta property="og:image" content="https://lekana.dev/thumb.png" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Free AI Document Scanner | Lekana Demo" />
	<meta
		name="twitter:description"
		content="Extract data from documents instantly with AI. No credit card required."
	/>
	<link rel="canonical" href="https://lekana.ai/scan" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<main class="relative flex min-h-screen flex-col items-center overflow-x-clip bg-neutral-950">
	<!-- NAV -->
	<nav
		class="fixed top-0 isolate z-20 flex w-full justify-center bg-linear-to-t from-white/5 to-black/30 backdrop-blur-md"
	>
		<div
			class="flex w-full max-w-sm items-center justify-between px-3 py-5 text-white md:max-w-6xl md:px-0 md:py-4"
		>
			<a href="/" class="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80">
				<img src="/logo.svg" alt="Lekana logo" class="h-6 w-6" />
				<span class="font-semibold">Lekana</span>
			</a>

			<div class="hidden items-center gap-8 text-sm text-gray-300 md:flex">
				<a href="/#about" class="transition-colors duration-300 hover:text-green-500">About</a>
				<a href="/#faq" class="transition-colors duration-300 hover:text-green-500">FAQ</a>

				<div
					class="glow-btn flex rounded-full p-0.5 shadow-lg transition-shadow duration-500 hover:shadow-green-500/50"
				>
					<a
						href="/scan"
						class="flex items-center gap-2 rounded-full bg-black px-6 py-3 transition-colors duration-300 hover:text-white"
					>
						Try Demo
						<ArrowRight />
					</a>
				</div>
			</div>
		</div>
	</nav>

	<style>
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


		.upload-box {
			transition all 0.3s ease;
		}

		.upload-box:hover,
		.upload-box.dragging {
			border-color: #05df72;
		}

		.upload-box.dragging {
			transform: scale(1.02);
		}

		.dark-scroll {
			scrollbar-width: thin;
			scrollbar-color: gray transparent;
		}

		.field-row {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			padding: 0.75rem 1rem;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			align-items: flex-start;
		}

		.field-row:hover {
			background: rgba(5, 223, 114, 0.03);
		}

		.field-row:last-child {
			border-bottom: none;
		}
	</style>

	<!-- File Preview Modal -->
	{#if previewUrl}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
			onclick={closePreview}
			onkeydown={(e) => e.key === 'Escape' && closePreview()}
		>
			<div
				class="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-neutral-900"
				onclick={stopPropagation}
				onkeydown={stopPropagation}
			>
				<div class="flex items-center justify-between border-b border-neutral-800 p-4">
					<p class="truncate font-medium text-white">{previewName}</p>
					<button onclick={closePreview} class="text-gray-400 transition-colors hover:text-white">
						<X class="h-5 w-5" />
					</button>
				</div>
				<div class="max-h-[calc(90vh-80px)] overflow-auto p-4">
					{#if previewName.match(/\.(png|jpg|jpeg|bmp|tiff)$/i)}
						<img src={previewUrl} alt={previewName} class="mx-auto h-auto max-w-full" />
					{:else}
						<iframe src={previewUrl} title={previewName} class="h-[70vh] w-full"></iframe>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<div
		class="relative flex w-full flex-1 items-center justify-center overflow-clip pt-16 pb-8 md:pt-32 md:pb-16"
	>
		<!-- Background glow -->
		<div
			class="absolute top-1/2 aspect-square w-full scale-200 animate-[pulse_5s_ease-in-out_infinite] justify-self-center rounded-full bg-radial from-green-500/15 to-transparent to-60% md:top-0 md:scale-150"
		></div>

		<!-- Main Content -->
		<section
			class="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center rounded-xl px-4 py-12 text-white md:px-24"
		>
			<!-- Progress Bar -->
			{#if currentStep < 4}
				<div class="mb-8 w-full max-w-md">
					<div class="h-1.5 overflow-hidden rounded-full bg-neutral-800">
						<div
							class="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500 ease-out"
							style="width: {progressPercent}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- STEP 1: Upload -->
			{#if currentStep === 1}
				<div class="text-center">
					<h1 class="text-3xl font-bold text-zinc-200 md:text-5xl">Try Our AI Scanner</h1>
					<p class="mx-auto mt-4 text-sm text-gray-400 md:text-base">
						Drop your document below and see Lekana do it's magic. It's completely free.
					</p>
				</div>

				<!-- Upload Box -->
				<div
					class="upload-box mt-12 flex w-full max-w-2xl cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-green-900 bg-neutral-950 p-8 backdrop-blur-sm md:min-h-96 md:p-12"
					class:dragging={isDragging}
					onclick={triggerFileInput}
					onkeydown={(e) => e.key === 'Enter' && triggerFileInput()}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
					role="button"
					tabindex="0"
					aria-label="Upload documents by clicking or dragging files here"
				>
					<input
						type="file"
						id="file-input"
						class="hidden"
						accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
						multiple
						onchange={handleFileInput}
						aria-label="File upload input"
					/>

					<div class="flex flex-col items-center gap-6">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full border border-green-900 bg-green-900/20"
						>
							<CloudUpload class="h-10 w-10 text-green-500" />
						</div>

						<div class="text-center">
							<p class="text-lg font-medium text-white md:text-xl">Click or drag & drop</p>
							<p class="mt-2 text-sm text-gray-400">PDFs, images, scans — we handle it all</p>
							<p class="mt-1 text-xs text-gray-500">Batch upload supported</p>
						</div>

						{#if files.length > 0}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="mt-4 w-full max-w-xs rounded-xl border border-green-950 bg-black/40 p-4 md:max-w-md"
								onclick={(event) => stopPropagation(event)}
								onkeydown={(event) => stopPropagation(event)}
							>
								<div class="mb-3 flex w-full items-center justify-between">
									<p class="text-sm font-medium text-green-500">
										{files.length} file{files.length > 1 ? 's' : ''} ready
									</p>
									<button
										type="button"
										onclick={(event) => goToStep2(event)}
										class="flex items-center gap-1.5 text-sm text-green-400 transition-colors hover:text-green-300"
									>
										Continue <ArrowRight class="h-4 w-4" />
									</button>
								</div>
								<ul class="dark-scroll max-h-32 w-full space-y-2 overflow-y-auto">
									{#each files as file, i}
										<li
											class="flex w-full items-center justify-between rounded-lg bg-black/30 py-2 text-sm text-gray-300"
										>
											<div class="flex w-full flex-col gap-1 overflow-hidden px-2">
												<span class="flex items-center gap-2 truncate">
													<FileText class="h-4 w-4 shrink-0 text-gray-500" />
													{file.name}</span
												>
												<span class="text-xs text-gray-500">({formatBytes(file.size)})</span>
											</div>
											<button
												onclick={() => removeFile(i)}
												class="shrink-0 p-2 text-gray-500 transition-colors hover:text-red-400"
												aria-label="Remove file"
											>
												<X class="h-4 w-4" />
											</button>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- STEP 2: Configure (user investment) -->
			{#if currentStep === 2}
				<div class="text-center">
					<h1 class="text-2xl font-bold text-zinc-200 md:text-4xl">Label Your Documents</h1>
					<p class="mx-auto mt-3 text-sm text-gray-400 md:text-base">
						Optional: Give your files friendly names to make the results easier to read.
					</p>
				</div>

				<div class="mt-8 w-full max-w-2xl space-y-4">
					{#each files as file, i}
						<div
							class="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
						>
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-green-900 bg-green-900/20"
							>
								<FileText class="h-6 w-6 text-green-500" />
							</div>
							<div class="min-w-0 flex-1">
								<p class="mb-1 truncate text-xs text-gray-500">{file.name}</p>
								<input
									type="text"
									bind:value={fileNames[file.name]}
									placeholder="e.g. Invoice March 2024"
									class="w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
								/>
							</div>
							<button
								onclick={() => removeFile(i)}
								class="shrink-0 text-gray-500 transition-colors hover:text-red-400"
								aria-label="Remove file"
							>
								<X class="h-5 w-5" />
							</button>
						</div>
					{/each}

					<div class="mt-8 flex justify-center gap-4">
						<button
							onclick={() => (currentStep = 1)}
							class="flex items-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm text-gray-300 transition-colors hover:border-neutral-600"
						>
							<ArrowLeft class="h-4 w-4" /> Add more files
						</button>
						<button
							onclick={goToStep3}
							class="flex items-center gap-2 rounded-full bg-neutral-800 px-8 py-3 text-sm text-white transition-all duration-300 hover:bg-neutral-900"
						>
							Extract Data <ArrowRight class="h-4 w-4" />
						</button>
					</div>
				</div>
			{/if}

			<!-- STEP 3: Auth & Process -->
			{#if currentStep === 3}
				<SignedOut>
					<!-- Motivation ABOVE sign in -->
					<div class="mb-6 text-center">
						<!-- <div
							class="mb-6 inline-flex items-center gap-2 rounded-full border border-green-800 bg-green-900/30 px-4 py-2"
						>
							<Sparkles class="h-4 w-4 text-green-400" />
							<span class="text-sm text-green-300"></span>
						</div> -->
						<h1 class="text-2xl font-bold text-zinc-200 md:text-4xl">
							You're almost there! One Quick Step
						</h1>
						<p class="mx-auto mt-3 text-sm text-gray-400 md:text-base">
							Create a free account to unlock your results. Takes less than 30 seconds.
						</p>
					</div>

					<!-- Trust signals -->
					<div class="mb-6 flex max-w-md flex-wrap justify-center gap-4">
						<div class="flex items-center gap-2 text-xs text-gray-400">
							<Lock class="h-3.5 w-3.5 text-green-500" />
							<span>100% Secure</span>
						</div>
						<div class="flex items-center gap-2 text-xs text-gray-400">
							<Shield class="h-3.5 w-3.5 text-green-500" />
							<span>No Credit Card</span>
						</div>
					</div>

					<!-- Files ready reminder -->
					<div class="mb-6 max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-900/30">
								<FileText class="h-5 w-5 text-green-400" />
							</div>
							<div>
								<p class="text-sm font-medium text-white">
									{files.length} document{files.length > 1 ? 's' : ''} queued
								</p>
								<p class="text-xs text-gray-400">Your files are ready and waiting</p>
							</div>
						</div>
					</div>

					<!-- Auth mode toggle -->
					<div
						class="mb-6 flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 p-1"
					>
						<button
							onclick={() => (authMode = 'signup')}
							class="rounded-full px-4 py-2 text-sm transition-all {authMode === 'signup'
								? 'bg-green-600 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							Sign up
						</button>
						<button
							onclick={() => (authMode = 'signin')}
							class="rounded-full px-4 py-2 text-sm transition-all {authMode === 'signin'
								? 'bg-green-600 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							Sign in
						</button>
					</div>

					<div class="flex w-full max-w-md items-center justify-center">
						{#if authMode === 'signup'}
							<SignUp redirectUrl="/scan" />
						{:else}
							<SignIn redirectUrl="/scan" />
						{/if}
					</div>

					<button
						onclick={() => (currentStep = 2)}
						class="mt-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-300"
					>
						<ArrowLeft class="h-4 w-4" /> Go back
					</button>
				</SignedOut>

				<SignedIn>
					{#if !isProcessing && !error}
						<div class="text-center">
							<h1 class="text-2xl font-bold text-zinc-200 md:text-4xl">Ready When You Are</h1>
							<p class="mx-auto mt-3 text-sm text-gray-400 md:text-base">
								Hit the button below and watch Lekana work its magic.
							</p>
						</div>

						<div
							class="mt-8 w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
						>
							<p class="mb-4 text-sm text-gray-300">Your documents:</p>
							<ul class="mb-6 space-y-2">
								{#each files as file}
									<li class="flex items-center gap-2 text-sm text-gray-400">
										<FileText class="h-4 w-4 text-green-500" />
										<span class="truncate">{fileNames[file.name] || file.name}</span>
									</li>
								{/each}
							</ul>

							<button
								onclick={processFiles}
								class="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-800 px-8 py-3 text-white transition-all duration-300 hover:bg-neutral-900"
							>
								<Sparkles class="h-4 w-4" /> Proceed to Results
							</button>
						</div>

						<button
							onclick={() => (currentStep = 2)}
							class="mt-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-300"
						>
							<ArrowLeft class="h-4 w-4" /> Go back
						</button>
					{/if}
					{#if isProcessing}
						<div class="flex flex-col items-center text-center">
							<!-- Minimal 3-bar loader -->
							<div class="mt-4 flex h-10 items-end gap-2">
								<div class="mini-bar h-6 w-2 bg-green-600"></div>
								<div class="mini-bar h-6 w-2 bg-green-500" style="animation-delay:0.15s;"></div>
								<div class="mini-bar h-6 w-2 bg-green-600" style="animation-delay:0.3s;"></div>
							</div>

							<h2 class="mt-6 text-xl font-semibold text-white">Analyzing your documents...</h2>
							<p class="mt-2 text-sm text-gray-400">Lekana is reading and extracting data...</p>
						</div>
					{/if}

					<style>
						.mini-bar {
							border-radius: 4px;
							animation: bounce 0.8s ease-in-out infinite;
							transform-origin: bottom;
						}

						@keyframes bounce {
							0%,
							100% {
								transform: scaleY(0.4);
								opacity: 0.7;
							}
							50% {
								transform: scaleY(1);
								opacity: 1;
							}
						}
					</style>

					{#if error}
						<div class="max-w-md text-center">
							<div class="mb-6 rounded-xl border border-red-900/50 bg-red-950/20 p-6">
								<p class="text-sm text-red-400">{error}</p>
							</div>
							<button
								onclick={processFiles}
								class="rounded-full border border-neutral-700 px-6 py-3 text-gray-300 transition-colors hover:border-green-500"
							>
								Try Again
							</button>
						</div>
					{/if}
				</SignedIn>
			{/if}

			<!-- STEP 4: Results -->
			{#if currentStep === 4 && results}
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
					>
						<CheckCircle class="h-8 w-8 text-green-500" />
					</div>
					<h1 class="text-2xl font-bold text-zinc-200 md:text-4xl">Here's What We Found</h1>
					<p class="mx-auto mt-3 text-sm text-gray-400 md:text-base">
						Successfully extracted data from {results.data?.documents?.length || 0} document{(results
							.data?.documents?.length || 0) !== 1
							? 's'
							: ''}.
					</p>
				</div>

				<!-- Metadata Stats -->
				{#if results.metadata}
					<div class="mb-8 flex flex-wrap justify-center gap-4">
						<div
							class="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2"
						>
							<Clock class="h-4 w-4 text-green-500" />
							<span class="text-sm text-gray-300"
								>{(results.metadata.processingTime / 1000).toFixed(1)}s</span
							>
						</div>
						<div
							class="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2"
						>
							<FileText class="h-4 w-4 text-green-500" />
							<span class="text-sm text-gray-300"
								>{results.metadata.documentCount} doc{results.metadata.documentCount !== 1
									? 's'
									: ''}</span
							>
						</div>
					</div>
				{/if}

				<!-- Documents Results -->
				<div class="w-full max-w-4xl space-y-6">
					{#if results.data?.documents}
						{#each results.data.documents as doc, i}
							<div class="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
								<!-- Document Header -->
								<div
									class="flex flex-col gap-2 border-b border-neutral-800 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="flex min-w-0 items-center gap-3">
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-green-900 bg-green-900/20"
										>
											<FileText class="h-5 w-5 text-green-500" />
										</div>
										<div class="min-w-0">
											<p class="truncate font-medium text-white">
												{fileNames[doc.filename] || doc.filename}
											</p>
										</div>
									</div>
									{#if files[i]}
										<button
											onclick={() => previewFile(i)}
											class="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-green-400"
										>
											<Eye class="h-4 w-4" />
											<span>View original</span>
										</button>
									{/if}
								</div>

								<!-- Fields Display -->
								{#if doc.fields && Object.keys(doc.fields).length > 0}
									<div class="divide-y divide-neutral-800/50">
										{#each Object.entries(doc.fields) as [fieldName, fieldData]}
											<div class="field-row">
												<div class="w-full sm:w-1/3">
													<span class="text-sm text-gray-200">
														{fieldName
															.replace(/([A-Z])/g, ' $1')
															.replace(/^./, (str) => str.toUpperCase())
															.replace(/(\d+)$/, ' $1')}
													</span>
												</div>
												<div class="flex flex-1 flex-wrap items-start gap-2">
													{#if fieldData.value}
														<span class="text-sm whitespace-pre-wrap text-white"
															>{fieldData.value}</span
														>
													{:else}
														<span class="text-sm text-gray-500 italic">Not detected</span>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="p-6 text-center text-gray-500">
										No structured fields extracted for this document.
									</div>
								{/if}
							</div>
						{/each}
					{:else}
						<!-- Fallback for unexpected response format -->
						<div class="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
							<p class="mb-2 text-xs tracking-wide text-gray-500 uppercase">Raw Response</p>
							<pre
								class="dark-scroll max-h-96 overflow-y-auto rounded-lg bg-black/30 p-4 text-sm whitespace-pre-wrap text-gray-300">{JSON.stringify(
									results,
									null,
									2
								)}</pre>
						</div>
					{/if}

					<div class="mt-8 flex justify-end">
						<button
							onclick={startOver}
							class="rounded-full border border-neutral-700 px-8 py-3 text-gray-300 transition-all duration-300 hover:border-green-500 hover:text-white"
						>
							Scan More Documents
						</button>
					</div>
				</div>
			{/if}

			<p class="mt-8 text-center text-xs text-gray-500">
				Your documents are processed securely and <b>never stored</b>.
			</p>
		</section>
	</div>

	<!-- FOOTER -->
	<footer class="w-full border-t border-green-950/60 bg-black/95">
		<div class="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-400 md:px-8 md:py-12">
			<div class="flex w-full justify-end pb-12">
				<Waitlist />
			</div>
			<div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
				<!-- Brand -->
				<div class="max-w-sm space-y-3">
					<p class="text-base font-semibold text-white">Lekana</p>
					<p class="text-xs leading-relaxed text-gray-500 md:text-sm">
						An OCR-powered document intake service for businesses. We read your documents,
						understand them, and route them into your workflow — fully managed, end-to-end.
					</p>
				</div>

				<!-- Navigation -->
				<nav class="flex flex-1 flex-wrap gap-10 md:justify-end" aria-label="Footer navigation">
					<div class="space-y-3">
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Product</p>
						<ul class="space-y-2 text-xs md:text-sm">
							<li><a href="/#about" class="hover:text-green-500">About</a></li>
							<li><a href="/#faq" class="hover:text-green-500">FAQ</a></li>
						</ul>
					</div>
					<div class="space-y-3">
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Company</p>
						<ul class="space-y-2 text-xs md:text-sm">
							<li><a href="/#waitlist" class="hover:text-green-500">Join waitlist</a></li>
							<!-- <li><a href="/" class="hover:text-green-500">Contact</a></li> -->
						</ul>
					</div>
					<div class="space-y-3">
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Legal</p>
						<ul class="space-y-2 text-xs md:text-sm">
							<li><a href="/privacy" class="hover:text-green-500">Privacy</a></li>
							<li><a href="/terms" class="hover:text-green-500">Terms</a></li>
						</ul>
					</div>
				</nav>
			</div>

			<hr class="mt-8 border-neutral-800" />

			<div
				class="mt-4 flex flex-col items-center justify-between gap-3 text-[11px] text-gray-500 md:flex-row md:text-xs"
			>
				<p>Lekana © {new Date().getFullYear()}. All rights reserved.</p>
				<p class="text-center md:text-right">
					Built for businesses that are done with the chaos of documents.
				</p>
			</div>
		</div>
	</footer>
</main>
