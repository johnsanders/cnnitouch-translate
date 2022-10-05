export const html = '<html lang="ar" dir="ltr" class="">';
export const head = `
		<script>
			const selectors = [
				'p',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'li',
				'ol',
				'ul',
				'strong',
				'a',
				'span',
				'.brand--ui',
				'.lesson-header__top-wrap',
				'.page-header-container',
				'.overview-sidebar__title',
				'.fr-view',
			];
			
			const rtlFix = () => {
				const els = document.querySelectorAll(selectors);
				els.forEach((el) => {
					el.setAttribute('dir', 'rtl');
					el.setAttribute('align', 'right');
				});
				const container = document.querySelector('.blocks-tabs__container');
				if (container)
					container.childNodes.forEach((node) => {
						node.setAttribute('dir', 'rtl');
						node.setAttribute('align', 'right');
					});
				const progress = document.querySelector('.page-header-container');
				if (progress) {
					progress.setAttribute('dir', 'rtl');
					progress.setAttribute('align', 'center');
				}
			};

			const run = () => setInterval(rtlFix, 1000);
			
			if (document.readyState !== 'loading') run();
			else document.addEventListener('DOMContentLoaded', run);
		</script>
`;
