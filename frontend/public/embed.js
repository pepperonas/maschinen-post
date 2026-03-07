// MaschinenPost Embed Widget
// Usage: <div id="maschinenpost-widget" data-count="5" data-category=""></div>
// <script src="https://maschinenpost.celox.io/embed.js"></script>
(function() {
  var container = document.getElementById('maschinenpost-widget');
  if (!container) return;

  var count = parseInt(container.dataset.count || '5', 10);
  var category = container.dataset.category || '';
  var baseUrl = 'https://maschinenpost.celox.io';

  var params = new URLSearchParams({ size: String(count), sort: 'published' });
  if (category) params.set('category', category);

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === 'style') Object.assign(node.style, attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    if (typeof children === 'string') node.textContent = children;
    else if (Array.isArray(children)) children.forEach(function(c) { if (c) node.appendChild(c); });
    return node;
  }

  fetch(baseUrl + '/api/articles?' + params)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var wrapper = el('div', { style: { fontFamily: 'monospace', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' } });
      wrapper.appendChild(el('div', { style: { background: '#0a0a0a', color: '#FFE000', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold' } }, 'MASCHINENPOST'));

      data.content.forEach(function(article) {
        var link = el('a', { href: article.url, target: '_blank', rel: 'noopener', style: { display: 'block', padding: '10px 12px', borderTop: '1px solid #222', color: 'inherit', textDecoration: 'none' } }, [
          el('div', { style: { fontSize: '13px', fontWeight: '600', marginBottom: '4px' } }, article.title),
          article.summary ? el('div', { style: { fontSize: '11px', color: '#999', fontStyle: 'italic' } }, article.summary) : null,
          el('div', { style: { fontSize: '10px', color: '#666', marginTop: '4px' } }, article.source)
        ]);
        wrapper.appendChild(link);
      });

      var footer = el('a', { href: baseUrl, target: '_blank', style: { display: 'block', padding: '6px 12px', textAlign: 'center', fontSize: '10px', color: '#FFE000', borderTop: '1px solid #222', textDecoration: 'none' } }, 'Powered by MaschinenPost');
      wrapper.appendChild(footer);

      container.appendChild(wrapper);
    })
    .catch(function() {
      container.appendChild(el('p', { style: { color: '#999', fontSize: '12px' } }, 'MaschinenPost konnte nicht geladen werden'));
    });
})();
