{
  description = "komet client, written in React.";

  #inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  #inputs.pnpm2nix.url = "github:TheArcaneBrony/pnpm2nix";
  #inputs.pnpm2nix.url = "path:/home/root@Rory/git/spacebar/client/pnpm2nix";
  #inputs.pnpm2nix.flake = false;
  inputs.nixpkgs.url = "github:lilyinstarlight/nixpkgs/unheck/nodejs";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
	let
		pkgs = import nixpkgs {
			inherit system;
		};
		#_pnpm2nix = import pnpm2nix { pkgs = nixpkgs.legacyPackages.${system}; };
	in rec {
		#packages.default = _pnpm2nix.mkPnpmPackage {
		packages.default = pkgs.buildNpmPackage {
			pname = "komet-client-react";
			src = ./.;
			name = "komet-client-react";
			#buildInputs = with pkgs; [ ];
			npmDepsHash = "$NPM_HASH";
			makeCacheWritable = true;
			installPhase = ''
				runHook preInstall
				cp -r dist $out/
				runHook postInstall
			'';
		};
		devShell = pkgs.mkShell {
			buildInputs = with pkgs; [
				nodejs
				nodePackages.pnpm
				nodePackages.typescript
			];
		};
	}
    );
}
