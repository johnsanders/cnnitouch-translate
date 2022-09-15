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
			
			const run = setinterval(rtlfix, 1000);
			
			const rtlfix = () => {
				const els = document.queryselectorall(selectors);
				els.foreach((el) => {
					el.setattribute('dir', 'rtl');
					el.setattribute('align', 'right');
				});
				const container = document.queryselector('.blocks-tabs__container');
				if (container)
					container.childnodes.foreach((node) => {
						node.setattribute('dir', 'rtl');
						node.setattribute('align', 'right');
					});
				const progress = document.queryselector('.page-header-container');
				if (progress) {
					progress.setattribute('dir', 'rtl');
					progress.setattribute('align', 'center');
				}
			};
			
			if (document.readystate !== 'loading') run();
			else document.addeventlistener('domcontentloaded');
		</script>
`;
