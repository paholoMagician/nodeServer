"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const hero_service_1 = require("./data/services/hero.service");
const hero = (0, hero_service_1.findHeroById)(3);
console.log((_a = hero === null || hero === void 0 ? void 0 : hero.nombreHumano) !== null && _a !== void 0 ? _a : 'Heroe no encontrado');
