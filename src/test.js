let tiles = [];
const waitInterval = 5;
const waitForSelector = (parentEl, selector, timeoutInMs) =>
	new Promise((resolve) => {
		const then = Date.now();
		const check = () => {
			const el = parentEl.querySelector(selector);
			if (el) resolve(el);
			else if (Date.now() - then < timeoutInMs) setTimeout(check, waitInterval);
			else resolve(undefined);
		};
		check();
	});
const waitForSelectorAll = (parentEl, selector, timeoutInMs) =>
	new Promise((resolve) => {
		const then = Date.now();
		const check = () => {
			const els = Array.from(parentEl.querySelectorAll(selector));
			if (els.length > 0) resolve(els);
			else if (Date.now() - then < timeoutInMs) setTimeout(check, waitInterval);
			else resolve(undefined);
		};
		check();
	});
const getClickedTileIndex = (x, y, tiles) => {
	const elementsUnderClick = document.elementsFromPoint(x, y);
	for (const element of elementsUnderClick) {
		if (!element.classList.contains('tile')) continue;
		for (const tile of tiles) if (element === tile) return element.id.replace('tile-', '');
	}
	return null;
};
const handleClick = async (e) => {
	const clickedTileIndex = getClickedTileIndex(e.clientX, e.clientY, tiles);
	if (!clickedTileIndex) return;
	const section = await waitForSelector(document, `#section-${clickedTileIndex}`, 1000);
	if (!section) return;
	const sectionResources = await waitForSelectorAll(section, 'ul.section li', 1000);
	if (sectionResources.length === 1) {
		section.style.display = 'none';
		const link = sectionResources[0].querySelector('a');
		if (link?.href) window.location.href = link.href;
	}
};
const run = async () => {
	tiles = Array.from(document.querySelectorAll('.tile'));
	document.addEventListener('click', handleClick);
	const openSection = await waitForSelector(document, 'li.section.state-visible', 1000);
	if (openSection) {
		const sectionResources = Array.from(openSection.querySelectorAll('ul.section li'));
		if (sectionResources.length === 1) openSection.style.display = 'none';
	}
};
if (document.readyState !== 'loading') run();
else document.addEventListener('DOMContentLoaded', run);
