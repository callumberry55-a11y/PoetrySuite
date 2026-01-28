{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ pkgs.nodejs_22_x pkgs.deno pkgs.typescript pkgs.supabase-cli ];
  idx.extensions = [ "denoland.vscode-deno" "bradlc.vscode-tailwindcss" "esbenp.prettier-vscode" "dbaeumer.vscode-eslint" ];
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = ["npm" "run" "dev" "--" "--port" "$PORT"];
        manager = "web";
      };
    };
  };
}
