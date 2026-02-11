// Print page: reads content from chrome.storage.session, renders, prints, closes.
chrome.storage.session.get('printData', (result) => {
  if (!result.printData) { window.close(); return; }
  const { html, styles, theme } = result.printData;
  document.documentElement.setAttribute('data-theme', theme);
  // Inject sidepanel styles
  const styleContainer = document.createElement('div');
  styleContainer.innerHTML = styles;
  for (const node of Array.from(styleContainer.children)) {
    document.head.appendChild(node);
  }
  document.getElementById('content').innerHTML = html;
  // Clean up storage
  chrome.storage.session.remove('printData');
  // Print after a brief delay for images/fonts to settle
  setTimeout(() => {
    window.addEventListener('afterprint', () => window.close());
    window.print();
  }, 300);
});
