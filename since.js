'use strict';

function prettySeconds(s) {
	let x = s;
	let seconds = (Math.floor(x % 60) + '').padStart(2, '0');
	x /= 60;
	let minutes = (Math.floor(x % 60) + '').padStart(2, '0');
	x /= 60;
	let hours = (Math.floor(x % 24) + '').padStart(2, '0');
	x /= 24;
	let days = Math.floor(x);
	return `${days}d ${hours}:${minutes}:${seconds}`;
}

function shsl(str, s, l) {
	let hash = 0;
	str.split('').forEach(char => {
		hash = char.charCodeAt(0) + ((hash << 5) - hash)
	})
	var h = hash % 360;
	return `hsl(${h}, ${s}%, ${l}%)`;
}

function sortNodes() {
	const list = document.querySelector('.container');
	[...list.children]
		.sort((a, b) => a.dataset.time < b.dataset.time ? 1 : -1)
		.forEach(node => list.appendChild(node));
}

class Memory {
	constructor(element, phases) {
		this.element = element;
		this.phases = phases;
		this.cur_phase = 0;
		this.last = new Date(parseInt(localStorage.getItem(phases.join(".")) ?? 0));
		this.element.addEventListener('click', this.lap.bind(this));
		this.element.addEventListener('dblclick', this.forget.bind(this));
		setInterval(this.render.bind(this), (Math.floor(Math.random() * 5) + 2) * 1000);
	}
	get ago() {
		return Math.abs((new Date().getTime() - this.last.getTime()) / 1000);
	}
	lap() {
		this.last = new Date();
		localStorage.setItem(this.phases.join("."), this.last.getTime());
		this.cur_phase = (this.cur_phase + 1) % this.phases.length;
		this.render();
	}
	forget() {
		if (confirm("Really delete since?")) {
			localStorage.removeItem(this.phases.join("."));
			this.element.remove();
		}
	}
	render() {
		this.element.querySelector('h2').innerText = this.phases[this.cur_phase];
		this.element.querySelector('p').innerText = prettySeconds(this.ago);
		this.element.dataset.time = this.last.getTime();
		sortNodes();
	}
}

function renderNodeHolder(names) {
	const el = document.createElement('div');
	el.classList.add('node');
	el.style.borderColor = shsl(names.join("."), 50, 50);
	el.style.backgroundColor = shsl(names.join("."), 30, 90);
	el.appendChild(document.createElement('h2'));
	el.appendChild(document.createElement('p'));
	document.querySelector('.container').appendChild(el);
	return el;
}

function fromLocalStorage() {
	for (let k = 0; k < localStorage.length; k++) {
		const nmem = localStorage.key(k).split(".");
		const el = renderNodeHolder(nmem);
		const n = new Memory(el, nmem);
		n.render();
	}
}

function newnode() {
	let names = [];
	while (true) {
		let inpt = prompt("Enter a phase name:\n(blank to continue)");
		if (inpt === "") {
			break
		}
		names.push(inpt);
	}
	if (names.length === 0) {
		return
	}

	const el = renderNodeHolder(names);
	const n = new Memory(el, names);
	n.lap();
}