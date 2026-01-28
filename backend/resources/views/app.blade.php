<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>KapdaFactory</title>
  <script type="module" crossorigin src="/assets/index-BgMqTGL0.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index-DWQ7zf25.css">
  <style>
    /* Mobile-first CSS fixes */
    .react-datepicker-popper {
      left: 50% !important;
      transform: translateX(-50%) !important;
      right: auto !important;
      max-width: 95vw !important;
    }

    .react-datepicker {
      max-width: 95vw !important;
    }

    /* Prevent horizontal scroll on mobile */
    html,
    body {
      overflow-x: hidden;
      max-width: 100vw;
    }
  </style>
</head>

<body>
  <div id="root"></div>
  <script>
    // Mobile camera fix: Make file inputs open camera first
    document.addEventListener('DOMContentLoaded', function() {
      // Observer to catch dynamically added file inputs
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              const fileInputs = node.querySelectorAll ? node.querySelectorAll('input[type="file"]') : [];
              fileInputs.forEach(function(input) {
                if (input.accept && input.accept.includes('image')) {
                  input.setAttribute('capture', 'environment');
                }
              });
              if (node.tagName === 'INPUT' && node.type === 'file' && node.accept && node.accept.includes('image')) {
                node.setAttribute('capture', 'environment');
              }
            }
          });
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Also handle existing inputs
      setInterval(function() {
        document.querySelectorAll('input[type="file"][accept*="image"]').forEach(function(input) {
          if (!input.hasAttribute('capture')) {
            input.setAttribute('capture', 'environment');
          }
        });
      }, 1000);
    });
  </script>
</body>

</html>