<!-- src/lib/components/DocumentScan.svelte -->
<script lang="ts">
	// Minimal UI only (dummy data). No API wiring yet. :contentReference[oaicite:0]{index=0}

	import { UploadCloud, FileText, CheckCircle2, Loader2, XCircle, Copy, Download } from 'lucide-svelte';

	type Status = 'Processing' | 'Done' | 'Failed';

	const docs = [
		{
			id: '1',
			name: 'invoice-acme-0142.pdf',
			status: 'Done' as Status,
			fields: [
				{ label: 'Vendor', value: 'ACME Supplies' },
				{ label: 'Invoice No', value: 'INV-0142' },
				{ label: 'Total', value: 'LKR 128,450.00' }
			],
			text:
				'INVOICE\nACME Supplies\nInvoice No: INV-0142\nDate: 2025-12-11\n...\nGrand Total: 128,450.00'
		},
		{
			id: '2',
			name: 'receipt-coffee.png',
			status: 'Processing' as Status,
			fields: [
				{ label: 'Merchant', value: 'Kandy Coffee Bar' },
				{ label: 'Total', value: 'LKR 1,450.00' }
			],
			text: 'KANDY COFFEE BAR\nLatte x1\nCroissant x1\nTotal 1,450.00\n...'
		},
		{
			id: '3',
			name: 'contract-sow.docx',
			status: 'Failed' as Status,
			fields: [{ label: 'Reason', value: 'Unsupported layout (dummy)' }],
			text: ''
		}
	];

	let selectedId = docs[0].id;
	$: selected = docs.find((d) => d.id === selectedId) ?? docs[0];

	function statusBadge(status: Status) {
		const base = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs';
		if (status === 'Done') return `${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-200`;
		if (status === 'Processing') return `${base} border-sky-500/30 bg-sky-500/10 text-sky-200`;
		return `${base} border-rose-500/30 bg-rose-500/10 text-rose-200`;
	}
</script>

<section class="relative mt-10">
	<div class="rounded-2xl border border-zinc-800 bg-black/20 backdrop-blur">
		<!-- Top: upload -->
		<div class="border-b border-zinc-800 p-5 md:p-7">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h3 class="text-lg font-semibold text-zinc-100">Scan documents</h3>
					<p class="mt-1 text-sm text-zinc-400">Upload files and get clean text + key fields.</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/30 px-5 py-2 text-sm text-zinc-200 hover:bg-black/45"
					>
						<UploadCloud size={16} class="text-zinc-300" />
						Choose files
					</button>

					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-200 hover:bg-emerald-500/15"
					>
						<FileText size={16} class="text-emerald-200" />
						Start scan
					</button>
				</div>
			</div>

			<!-- Dropzone (minimal) -->
			<div class="mt-4 grid place-items-center rounded-xl border border-dashed border-zinc-700 bg-black/10 p-8 text-center">
				<UploadCloud size={34} class="mb-3 text-zinc-500" />
				<p class="text-sm text-zinc-300">Drop files here</p>
				<p class="mt-1 text-xs text-zinc-500">PDF / PNG / JPG / DOCX</p>
			</div>
		</div>

		<!-- Bottom: results -->
		<div class="grid gap-4 p-4 md:grid-cols-12 md:gap-6 md:p-7">
			<!-- List -->
			<div class="md:col-span-5">
				<div class="rounded-xl border border-zinc-800 bg-black/10">
					<div class="flex items-center justify-between border-b border-zinc-800 p-4">
						<p class="text-sm font-medium text-zinc-100">Your files</p>
						<p class="text-xs text-zinc-500">{docs.length}</p>
					</div>

					<div class="p-2">
						{#each docs as d}
							<button
								type="button"
								on:click={() => (selectedId = d.id)}
								class={[
									'flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition',
									selectedId === d.id
										? 'border-emerald-500/30 bg-emerald-500/10'
										: 'border-zinc-800 bg-black/10 hover:bg-black/30'
								].join(' ')}
							>
								<div class="min-w-0">
									<p class="truncate text-sm text-zinc-100">{d.name}</p>
									<p class="mt-1 text-xs text-zinc-500">
										{#if d.status === 'Done'}
											<CheckCircle2 size={14} class="mr-1 inline text-emerald-300" />
										{:else if d.status === 'Processing'}
											<Loader2 size={14} class="mr-1 inline animate-spin text-sky-300" />
										{:else}
											<XCircle size={14} class="mr-1 inline text-rose-300" />
										{/if}
										{d.status}
									</p>
								</div>

								<span class={statusBadge(d.status)}>{d.status}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Details -->
			<div class="md:col-span-7">
				<div class="rounded-xl border border-zinc-800 bg-black/10">
					<div class="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-zinc-100">{selected.name}</p>
							<p class="mt-1 text-xs text-zinc-500">Preview of what the scan found</p>
						</div>

						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-xs text-zinc-200 hover:bg-black/45"
							>
								<Copy size={14} class="text-zinc-300" />
								Copy text
							</button>
							<button
								type="button"
								class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-xs text-zinc-200 hover:bg-black/45"
							>
								<Download size={14} class="text-zinc-300" />
								Download JSON
							</button>
						</div>
					</div>

					<div class="grid gap-4 p-4 md:grid-cols-2">
						<!-- Key fields -->
						<div class="rounded-xl border border-zinc-800 bg-black/10 p-4">
							<p class="text-sm font-medium text-zinc-100">Key fields</p>
							<p class="mt-1 text-xs text-zinc-500">The important stuff, extracted.</p>

							<div class="mt-4 space-y-3">
								{#each selected.fields as f}
									<div class="flex items-start justify-between gap-3">
										<p class="text-xs text-zinc-500">{f.label}</p>
										<p class="text-sm text-zinc-100">{f.value}</p>
									</div>
								{/each}
							</div>
						</div>

						<!-- Text -->
						<div class="rounded-xl border border-zinc-800 bg-black/10 p-4">
							<p class="text-sm font-medium text-zinc-100">Text</p>
							<p class="mt-1 text-xs text-zinc-500">A short preview of the transcription.</p>

							{#if selected.text}
								<pre
									class="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/20 p-3 text-xs leading-relaxed text-zinc-200"
								>{selected.text}</pre>
							{:else}
								<div class="mt-4 rounded-lg border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-400">
									No text available.
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
