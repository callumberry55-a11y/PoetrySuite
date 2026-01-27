{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_22_x
  ];

  idx.extensions = [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ];

  idx.previews = {
    enable = true;
    previews = [ {
      name = "web";
      command = [ "npm", "run", "dev" ];
      port = 5173;
      onPortFound = "open";
    } ];
  };
}
