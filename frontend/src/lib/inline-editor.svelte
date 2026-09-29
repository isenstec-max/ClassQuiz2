<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { run } from 'svelte/legacy';

	import {
		BalloonEditor,
		Essentials,
		Autoformat,
		Bold,
		Italic,
		Paragraph,
		TextTransformation,
		Superscript,
		Subscript,
		Strikethrough
	} from 'ckeditor5';
	import 'ckeditor5/ckeditor5.css';

	const triggerChange = () => {
		text = editor.getData();
	};

	import { onMount } from 'svelte';
	interface Props {
		// import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat"
		text?: string;
	}

	let { text = $bindable('') }: Props = $props();

	let html_el = $state();

	run(() => {
		text = text.replace('<p>', '').replace('</p>', '');
	});
	let editor;
	onMount(() => {
		class Editor extends BalloonEditor {
			static builtinPlugins = [
				Essentials,
				Autoformat,
				Bold,
				Italic,
				Paragraph,
				TextTransformation,
				Strikethrough,
				Subscript,
				Superscript
			];

			static defaultConfig = {
				language: 'en'
			};
		}
		// BalloonEditor.builtinPlugins = [Strikethrough]
		Editor.create(html_el, {
			licenseKey: 'GPL',
			// plugins: [Strikethrough],
			config: {
				enterMode: BalloonEditor.ENTER_DIV,
				shiftEnterMode: BalloonEditor.ENTER_BR
			},
			toolbar: [
				'bold',
				'italic',
				'strikethrough',
				'superscript',
				'subscript',
				'|',
				'undo',
				'redo'
			]
		})
			.then((newEditor) => {
				editor = newEditor;
				editor.setData(text);
				editor.model.document.on('change:data', () => {
					triggerChange();
				});
			})
			.catch((error) => {
				console.error('There was a problem initializing the editor.', error);
			});
	});
</script>

<div class="w-full max-w-xl flex justify-center">
	<div
		bind:this={html_el}
		contenteditable="true"
		class="w-full text-center px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white font-bold text-xl md:text-2xl shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-w-[12rem] cursor-text"
	></div>
</div>

<style>
	:global(.ck-powered-by) {
		display: none;
	}
</style>
