{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_22_x
  ];

  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];

  idx.previews = {
    enable = true;
    previews = [ {
      name = "web";
      command = [ "npm" "run" "dev" ];
      port = 5173;
      onPortFound = "open";
    } ];
  };
}
