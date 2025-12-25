<script>
	import DocumentScan from '$lib/components/DocumentScan.svelte';
	import Waitlist from '$lib/components/Waitlist.svelte';
	import {
		CloudUpload,
		Sparkles,
		FileSearch,
		BarChart3,
		Server,
		ScanText,
		Workflow,
		Languages,
		ArrowRight
	} from 'lucide-svelte';

	const steps = [
		{ label: 'Upload Document', icon: CloudUpload },
		{ label: 'Identify Content', icon: Sparkles },
		{ label: 'Identify Sections', icon: FileSearch },
		{ label: 'Generate Insights', icon: BarChart3 }
	];

	let data = {
		name: '',
		company: '',
		email: '',
		contact: '',
		role: '',
		industry: '',
		volume: '',
		docs: ''
	};

	let agreeToContact = false;
	let message = '';
	let loading = false;

	async function submitToWaitlist() {
		if (!agreeToContact) {
			message = 'Please agree to be contacted before submitting.';
			return;
		}

		loading = true;
		message = '';

		try {
			const response = await fetch('/api/waitlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
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

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Lekana - AI-Powered Document Automation | Intelligent OCR & Workflow Platform</title>
	<meta
		name="description"
		content="Transform your document chaos with Lekana's AI-powered automation. Our intelligent OCR and LLM technology extracts, structures, and routes documents automatically — no coding required."
	/>
	<meta
		name="keywords"
		content="AI document processing, intelligent OCR, document automation, AI workflow automation, machine learning document extraction, automated document routing, LLM document understanding, artificial intelligence business automation, smart document management, AI-powered OCR"
	/>
	<meta name="author" content="Lekana" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://lekana.dev/" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://lekana.dev/" />
	<meta
		property="og:title"
		content="Lekana - AI-Powered Document Automation | Intelligent OCR & Workflow Platform"
	/>
	<meta
		property="og:description"
		content="Transform your document chaos with Lekana's AI-powered automation. Our intelligent OCR and LLM technology extracts, structures, and routes documents automatically."
	/>
	<meta property="og:image" content="https://lekana.dev/thumb.png" />
	<meta property="og:site_name" content="Lekana" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://lekana.dev/" />
	<meta name="twitter:title" content="Lekana - AI-Powered Document Automation" />
	<meta
		name="twitter:description"
		content="Transform your document chaos with AI-powered automation. Intelligent OCR + LLM technology for automatic document processing."
	/>
	<meta property="og:image" content="/thumb.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
		rel="stylesheet"
	/>
	<meta name="twitter:image" content="https://lekana.dev/thumb.png" />

	<!-- Additional SEO Meta Tags -->
	<meta name="theme-color" content="#05df72" />
	<meta name="application-name" content="Lekana" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": "https://lekana.dev/#organization",
				"name": "Lekana",
				"url": "https://lekana.dev",
				"logo": {
					"@type": "ImageObject",
					"url": "https://lekana.dev/logo.svg"
				},
				"description": "AI-powered document automation platform using intelligent OCR and LLM technology",
				"sameAs": []
			},
			{
				"@type": "WebSite",
				"@id": "https://lekana.dev/#website",
				"url": "https://lekana.dev",
				"name": "Lekana",
				"publisher": {
					"@id": "https://lekana.dev/#organization"
				},
				"description": "AI-Powered Document Automation Platform"
			},
			{
				"@type": "SoftwareApplication",
				"@id": "https://lekana.dev/#software",
				"name": "Lekana",
				"applicationCategory": "BusinessApplication",
				"operatingSystem": "Web",
				"description": "AI-powered document intake and automation service that uses intelligent OCR and LLM technology to extract, structure, and route business documents automatically.",
				"offers": {
					"@type": "Offer",
					"availability": "https://schema.org/PreOrder",
					"description": "Join the waitlist for early access"
				},
				"featureList": [
					"AI-Powered Document Recognition",
					"Intelligent OCR with LLM Understanding",
					"Automated Workflow Routing",
					"Multi-language Support",
					"Custom Integration APIs",
					"Secure Private Portal"
				],
				"publisher": {
					"@id": "https://lekana.dev/#organization"
				}
			},
			{
				"@type": "FAQPage",
				"@id": "https://lekana.dev/#faq",
				"mainEntity": [
					{
						"@type": "Question",
						"name": "How does Lekana actually work day-to-day?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "You connect your document sources (email inboxes, uploads, storage, or APIs) and tell us what you want to happen. We configure document types, fields to extract, validation rules, and routing destinations. Once live, new documents are automatically read, structured, and sent into your systems — without your team touching each file."
						}
					},
					{
						"@type": "Question",
						"name": "What kinds of documents can you handle?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "We work with PDFs, scans, and image-based documents including invoices, forms, contracts, ID documents, shipping documents, statements, and more. Layout-heavy documents, multipage files, tables, and semi-structured forms are all supported thanks to our OCR + LLM stack."
						}
					},
					{
						"@type": "Question",
						"name": "Can you integrate with our existing tools and APIs?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "Yes. We can push structured data into CRMs, ERPs, helpdesk tools, internal databases, webhooks, or custom APIs. During onboarding, we map your document fields to the exact objects and endpoints you use today."
						}
					},
					{
						"@type": "Question",
						"name": "Do we need internal engineering resources to use Lekana?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "No. Lekana is designed for operations, finance, and business teams. You describe your current process, share example documents, and confirm the outputs you need. We handle all configuration, integrations, and maintenance behind the scenes."
						}
					},
					{
						"@type": "Question",
						"name": "How do you handle security and data privacy?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "Data security is a core part of the product. Your documents are processed in controlled environments, and access is restricted through your private portal. We can discuss data retention, encryption, and compliance requirements during onboarding."
						}
					},
					{
						"@type": "Question",
						"name": "What does the private portal include?",
						"acceptedAnswer": {
							"@type": "Answer",
							"text": "Your portal gives you visibility into document intake, processing status, extracted fields, and delivery logs. You can review edge cases, export data, and adjust workflows with our team — without touching any low-level infrastructure."
						}
					}
				]
			}
		]
	}
	</script>`}
</svelte:head>

<main class="relative flex flex-col items-center overflow-x-clip bg-neutral-950">
	<!-- NAV -->
	<nav
		class="fixed top-0 isolate z-20 flex w-full justify-center bg-linear-to-t from-white/5 to-black/30 backdrop-blur-md"
	>
		<div
			class="flex w-full max-w-sm items-center justify-between px-3 py-5 text-white md:max-w-6xl md:px-0 md:py-4"
		>
			<a href="/" class="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80">
				<img src="/logo.svg" alt="logo" class="h-6 w-6" />
				<span class="font-semibold">Lekana</span>
			</a>

			<div class="hidden items-center gap-8 text-sm text-gray-300 md:flex">
				<a href="#about" class="transition-colors duration-300 hover:text-green-500">About</a>
				<a href="#faq" class="transition-colors duration-300 hover:text-green-500">FAQ</a>

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

		.chaos-text {
			font-family: 'Caveat', cursive;
			color: #05df72;
			position: relative;
			display: inline-block;
			transform: rotate(-2deg);
			font-size: 1.3em;
			letter-spacing: 0.02em;
			text-decoration: none;
			transition: transform 0.3s ease;
		}

		.chaos-text:hover {
			transform: rotate(-3deg) scale(1.05);
		}

		/* Scribble underline effect - like messy documents */
		.chaos-text::after {
			content: '';
			position: absolute;
			left: -5%;
			right: -5%;
			bottom: 0.1em;
			height: 0.15em;
			background: linear-gradient(
				90deg,
				transparent 0%,
				#05df72 5%,
				#05df72 15%,
				transparent 18%,
				#05df72 22%,
				#05df72 45%,
				transparent 48%,
				#05df72 52%,
				#05df72 78%,
				transparent 82%,
				#05df72 85%,
				#05df72 95%,
				transparent 100%
			);
			transform: rotate(1deg);
			opacity: 0.7;
		}
	</style>

	<div
		class="absolute top-1/12 aspect-square w-full scale-[400%] animate-[pulse_5s_ease-in-out_infinite] justify-self-center rounded-full bg-radial from-green-500/15 to-transparent to-60% md:top-0 md:scale-150"
	></div>
	<section
		class="relative z-10 flex min-h-screen max-w-sm flex-col px-3 py-8 pt-24 text-white md:h-screen md:max-w-6xl md:flex-row md:py-32 md:pt-44"
	>
		<div class="relative z-10 flex flex-col justify-center">
			<div class="mb-6 flex flex-col gap-4 px-2">
				<h1 class="text-5xl leading-tight font-bold text-zinc-300 md:text-6xl">
					Say goodbye to the document <span class="chaos-text -mt-4">chaos.</span>
				</h1>
				<p class="mx-auto mt-2 max-w-2xl text-sm text-gray-400 md:text-base">
					Let’s build the automated workflow for your business you always needed.
				</p>
			</div>

			<Waitlist />
		</div>
		<DocumentScan />
	</section>

	<!-- WORKFLOW -->
	<section class="relative z-10 max-w-sm py-12 text-center text-white md:max-w-6xl md:py-28">
		<h2 class="text-2xl font-semibold md:text-4xl">Automate workflows</h2>
		<p class="mt-3 text-xs text-gray-400 md:text-base">
			Let’s build the automated workflow for your business you always needed.
		</p>

		<div class="mt-16 flex flex-col flex-wrap justify-center gap-4 md:flex-row">
			{#each steps as step, i}
				<div class="flex flex-col items-center md:flex-row">
					<!-- Step card -->
					<div class="group flex flex-col items-center hover:cursor-pointer">
						<div
							class="flex items-center justify-center rounded-xl border border-green-900 bg-green-900/20 p-4 shadow-xl transition-shadow duration-300 group-hover:shadow-green-500/50 md:p-6"
						>
							<svelte:component
								this={step.icon}
								class="text-3xl text-white md:text-4xl"
								size={36}
							/>
						</div>
						<p
							class="mt-4 text-center text-sm transition-transform duration-300 group-hover:translate-y-1"
						>
							{step.label}
						</p>
					</div>

					<!-- Connector node (between steps) -->
					{#if i < steps.length - 1}
						<div class="group mt-2 flex flex-col items-center md:mt-0 md:ml-4 md:flex-row">
							<div class="mx-1 h-2 w-2 rounded-full bg-green-400 shadow-md shadow-green-500"></div>
							<div
								class="h-8 w-0.5 bg-linear-to-r from-green-500 to-green-800 md:h-0.5 md:w-16"
							></div>
							<div class="mx-1 h-2 w-2 rounded-full bg-green-700 shadow-md shadow-green-800"></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- FEATURES -->
	<section class="z-10 max-w-7xl py-28 text-white">
		<h2 class="text-center text-4xl font-semibold">Why businesses use Lekana</h2>

		<div class="mt-16 grid gap-10 px-6 md:grid-cols-4 md:px-16">
			<!-- 1 -->
			<div
				class="group rounded-xl border border-green-950 bg-neutral-900 p-6
				   shadow-xl shadow-green-950/20 transition-all delay-75 duration-500 hover:shadow-green-700/50"
			>
				<Server
					class="mb-4 text-4xl text-gray-500 transition-colors duration-300 group-hover:text-green-500"
					size={36}
				/>
				<h3 class="mb-2 text-xl font-semibold">No Infrastructure Required</h3>
				<p class="text-sm text-gray-400">
					You tell us the workflow — we set everything up for you.
				</p>
			</div>

			<!-- 2 -->
			<div
				class="group rounded-xl border border-green-950 bg-neutral-900 p-6
				   shadow-xl shadow-green-950/20 transition-all delay-75 duration-500 hover:shadow-green-700/50"
			>
				<ScanText
					class="mb-4 text-4xl text-gray-500 transition-colors duration-300 group-hover:text-green-500"
					size={36}
				/>
				<h3 class="mb-2 text-xl font-semibold">Deep OCR Understanding</h3>
				<p class="text-sm text-gray-400">
					We extract structured data from PDFs, scans, invoices, forms, and more.
				</p>
			</div>

			<!-- 3 -->
			<div
				class="group rounded-xl border border-green-950 bg-neutral-900 p-6
				   shadow-xl shadow-green-950/20 transition-all delay-75 duration-500 hover:shadow-green-700/50"
			>
				<Workflow
					class="mb-4 text-4xl text-gray-500 transition-colors duration-300 group-hover:text-green-500"
					size={36}
				/>
				<h3 class="mb-2 text-xl font-semibold">Custom Routing</h3>
				<p class="text-sm text-gray-400">
					Data flows directly into your internal tools, CRMs, or automations.
				</p>
			</div>

			<!-- 4 -->
			<div
				class="group rounded-xl border border-green-950 bg-neutral-900 p-6
		   shadow-xl shadow-green-950/20 transition-all delay-75 duration-500 hover:shadow-green-700/50"
			>
				<Languages
					class="mb-4 text-4xl text-gray-500 transition-colors duration-300 group-hover:text-green-500"
					size={36}
				/>
				<h3 class="mb-2 text-xl font-semibold">Multilingual Support</h3>
				<p class="text-sm text-gray-400">
					Reads documents across many languages and even handwriting
				</p>
			</div>
		</div>
	</section>

	<!-- ABOUT -->
	<section id="about" class="w-full py-14 text-white">
		<div class="mx-auto max-w-6xl px-4 md:px-8">
			<h2 class="text-center text-4xl font-bold md:text-5xl">About Lekana</h2>
			<p class="mx-auto mt-6 text-center text-sm leading-relaxed text-gray-400 md:text-base">
				Lekana is an OCR-powered document intake service for businesses. We read your incoming
				documents — PDFs, scans, invoices, and forms — understand them using advanced OCR + LLM
				models, and route the data into your custom workflow. You don’t build or maintain anything:
				you describe the workflow, we set it up, and give you a secure private portal.
			</p>

			<div class="mt-24 grid gap-10 md:grid-cols-[1.5fr,1.2fr] md:items-start">
				<!-- Left column: narrative -->
				<div class="space-y-8 text-sm text-gray-300 md:text-base">
					<div>
						<h3 class="text-lg font-semibold text-white md:text-xl">Fully managed from day one</h3>
						<p class="mt-3 leading-relaxed text-gray-400">
							Most “automation” tools still expect you to wire up APIs, build pipelines, and manage
							models. Lekana is different. We operate as a managed intake layer for your business:
							we connect to your inboxes, storage, or uploads, and deliver structured, validated
							data where it needs to go — with humans completely out of the loop. models. Lekana is
							different. We operate as a managed intake layer for your business: we connect to your
							inboxes, storage, or uploads, and deliver structured, validated data where it needs to
							go — with humans completely out of the loop.
						</p>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-white md:text-xl">
							OCR + LLMs tuned for real documents
						</h3>
						<p class="mt-3 leading-relaxed text-gray-400">
							Under the hood, we combine high-accuracy OCR with large language models and
							domain-specific validation. That means we can handle blurry scans, multi-page PDFs,
							mixed layouts, tables, signatures, and edge cases — not just perfect templates.
						</p>
					</div>

					<div>
						<h3 class="text-lg font-semibold text-white md:text-xl">
							Plug into your existing workflow
						</h3>
						<p class="mt-3 leading-relaxed text-gray-400">
							Whether you work out of a CRM, ERP, ticketing system, shared inbox, or internal
							database, we adapt to you. We map each document type to your internal fields and
							actions, set up routing logic, and keep everything synchronized as your processes
							evolve.
						</p>
					</div>
				</div>

				<!-- Right column: highlight card -->
				<div
					class="rounded-2xl border border-green-950 bg-neutral-900/80 p-6 shadow-2xl shadow-green-950/40 md:mt-12 md:p-7"
				>
					<h3 class="text-lg font-semibold text-white md:text-xl">Built for operations teams</h3>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						Lekana is ideal for teams buried in repetitive document work:
					</p>

					<ul class="mt-4 space-y-3 text-sm text-gray-300">
						<li class="flex items-start gap-3">
							<span class="mt-1 h-1.5 w-1.5 rounded-full bg-green-400"></span>
							<span>Invoice and billing intake for finance and accounting.</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="mt-1 h-1.5 w-1.5 rounded-full bg-green-400"></span>
							<span>KYC, onboarding, and compliance documents for financial services.</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="mt-1 h-1.5 w-1.5 rounded-full bg-green-400"></span>
							<span>Contracts, submissions, and case files for legal and operations teams.</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="mt-1 h-1.5 w-1.5 rounded-full bg-green-400"></span>
							<span>Logistics, shipping, and customs paperwork for supply chain teams.</span>
						</li>
					</ul>

					<div class="mt-6 grid grid-cols-1 gap-4 text-sm text-gray-300 md:grid-cols-2">
						<div class="rounded-xl border border-green-950/80 bg-black/40 p-4">
							<p class="text-xs tracking-wide text-gray-500 uppercase">Setup</p>
							<p class="mt-2 text-lg font-semibold text-white">Done-for-you</p>
							<p class="mt-1 text-xs text-gray-400">You describe the workflow, we implement it.</p>
						</div>
						<div class="rounded-xl border border-green-950/80 bg-black/40 p-4">
							<p class="text-xs tracking-wide text-gray-500 uppercase">Access</p>
							<p class="mt-2 text-lg font-semibold text-white">Private portal</p>
							<p class="mt-1 text-xs text-gray-400">
								Monitor status, exports, and analytics in one place.
							</p>
						</div>
					</div>

					<p class="mt-6 text-xs text-gray-500">
						You keep ownership of your data. We handle ingestion, structure, routing, and
						reliability.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section id="faq" class="w-full py-4 pt-12 text-white">
		<div class="mx-auto w-full max-w-4xl px-4 md:px-8">
			<h2 class="text-center text-4xl font-bold md:text-5xl">FAQ</h2>
			<p
				class="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-gray-400 md:text-base"
			>
				Answers to the most common questions about how Lekana fits into your stack and operations.
				Answers to the most common questions about how Lekana fits into your stack and operations.
			</p>

			<div class="mx-auto mt-10 w-full space-y-6">
				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
					open
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>How does Lekana actually work day-to-day?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						You connect your document sources (email inboxes, uploads, storage, or APIs) and tell us
						what you want to happen. We configure document types, fields to extract, validation
						rules, and routing destinations. Once live, new documents are automatically read,
						structured, and sent into your systems — without your team touching each file.
					</p>
				</details>

				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>What kinds of documents can you handle?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						We work with PDFs, scans, and image-based documents including invoices, forms,
						contracts, ID documents, shipping documents, statements, and more. Layout-heavy
						documents, multipage files, tables, and semi-structured forms are all supported thanks
						to our OCR + LLM stack.
					</p>
				</details>

				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>Can you integrate with our existing tools and APIs?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						Yes. We can push structured data into CRMs, ERPs, helpdesk tools, internal databases,
						webhooks, or custom APIs. During onboarding, we map your document fields to the exact
						objects and endpoints you use today, so your team continues to work inside the tools
						they already know.
					</p>
				</details>

				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>Do we need internal engineering resources to use Lekana?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						No. Lekana is designed for operations, finance, and business teams. You describe your
						current process, share example documents, and confirm the outputs you need. We handle
						all configuration, integrations, and maintenance behind the scenes.
					</p>
				</details>

				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>How do you handle security and data privacy?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						Data security is a core part of the product. Your documents are processed in controlled
						environments, and access is restricted through your private portal. We can discuss data
						retention, encryption, and compliance requirements during onboarding and align with your
						internal standards.
					</p>
				</details>

				<details
					class="group w-full rounded-lg border border-green-950 bg-neutral-900 p-5 shadow-lg shadow-green-950/20 transition-all duration-300"
				>
					<summary
						class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold md:text-base"
					>
						<span>What does the private portal include?</span>
						<span
							class="ml-4 text-xs text-gray-500 transition-transform duration-200 group-open:rotate-90"
							>&rsaquo;</span
						>
					</summary>
					<p class="mt-3 text-sm leading-relaxed text-gray-400">
						Your portal gives you visibility into document intake, processing status, extracted
						fields, and delivery logs. You can review edge cases, export data, and adjust workflows
						with our team — without touching any low-level infrastructure.
					</p>
				</details>
			</div>
		</div>
	</section>

	<!-- FOOTER -->
	<footer class="mt-14 w-full border-t border-green-950/60 bg-black/95">
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
				<div class="flex flex-1 flex-wrap gap-10 md:justify-end">
					<div class="space-y-3">
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Product</p>
						<ul class="space-y-2 text-xs md:text-sm">
							<li><a href="#about" class="hover:text-green-500">About</a></li>
							<li><a href="#faq" class="hover:text-green-500">FAQ</a></li>
						</ul>
					</div>
					<div class="space-y-3">
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Company</p>
						<ul class="space-y-2 text-xs md:text-sm">
							<li><a href="#waitlist" class="hover:text-green-500">Join waitlist</a></li>
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
				</div>

				<!-- Call to action -->
				<!-- <div class="space-y-3 text-xs md:text-sm">
					<div
						class="glow-btn flex w-fit rounded-full p-0.5 shadow-lg transition-shadow duration-500 hover:shadow-green-500/50"
					>
						<a
							href="#waitlist"
							class="rounded-full bg-black px-6 py-3 text-white transition-colors duration-300"
						>
							Join Waitlist
						</a>
					</div>
				</div> -->
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
