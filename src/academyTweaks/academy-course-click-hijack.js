let tiles = [];
const waitInterval = 10;
const waitTimeout = 5000;
const waitForSelector = (parentEl, selector, timeoutInMs) =>
	new Promise((resolve) => {
		const then = Date.now();
		const check = () => {
			const el = parentEl.querySelector(selector);
			if (el) resolve(el);
			else if (Date.now() - then < timeoutInMs) setTimeout(check, waitInterval);
			else resolve(null);
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
			else resolve([]);
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
	const section = await waitForSelector(document, `#section-${clickedTileIndex}`, waitTimeout);
	if (!section) return;
	const sectionResources = await waitForSelectorAll(section, 'ul.section li', waitTimeout);
	if (sectionResources.length === 1) {
		section.style.display = 'none';
		const link = sectionResources[0].querySelector('a');
		if (link?.href) window.location.href = link.href;
	}
};
const run = async () => {
	if (!document.body.id === 'page-course-view-tiles') return;
	const res = await fetch(
		`https://academy.cnn.com/lib/ajax/service.php?info=format_tiles_get_single_section_page_html&sesskey=${window.M.cfg.sesskey}`,
		{
			body: JSON.stringify({
				args: {
					courseid: '12',
					sectionid: 2,
					setjsusedsession: true,
				},
				index: 0,
				methodname: 'format_tiles_get_single_section_page_html',
			}),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		},
	);
	const html = await res.text();
	console.log(html);
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