<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Snatched Diary</title>
    <style>
      body {
        font-family: 'Quicksand', sans-serif;
        background-color: #FFFFFF;
        color: #334155;
      }
      /* Hide scrollbar for premium feel */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  </head>
  <body class="bg-white min-h-screen text-slateText antialiased overflow-hidden selection:bg-frostBlue selection:text-accentBlue">
    <div id="root" class="h-full w-full relative"></div>
    
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
