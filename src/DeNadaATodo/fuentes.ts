import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

// Carga las fuentes. En los estilos se usan como "Playfair Display" e "Inter".
loadPlayfair("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });
loadPlayfair("italic", { weights: ["400"], subsets: ["latin"] });
loadInter("normal", { weights: ["300", "500"], subsets: ["latin"] });
