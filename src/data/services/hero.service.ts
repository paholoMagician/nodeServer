import { heroesMarvel } from "../heroes";


export const findHeroById = (id: number) => {
    return heroesMarvel.find((hero) => hero.id == id);
}