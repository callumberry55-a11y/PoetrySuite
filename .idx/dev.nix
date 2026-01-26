      {pkgs}: {
        channel = "stable-24.05";
        packages = [
          pkgs.nodejs_22_x
        ];
        idx.extensions = [
          "svelte.svelte-vscode"
          "vue.volar"
        ];
        idx.previews = {
          previews = {
            web = {
              command = [
