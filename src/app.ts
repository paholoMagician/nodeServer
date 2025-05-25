import { findHeroById } from "./data/services/hero.service";




const hero = findHeroById(3);
console.log(hero?.nombreHumano ?? 'Heroe no encontrado');
