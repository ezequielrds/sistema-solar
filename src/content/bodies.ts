export interface OrbitalElements {
  period: number;
  eccentricity: number;
  inclination: number;
  meanAnomaly: number;
  periapsis: number;
  node: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  kind: 'star' | 'planet' | 'moon';
  parent?: string;
  subtitle: string;
  color: string;
  texture?: string;
  radius: number;
  distance: number;
  diameter: number;
  distanceKm: number;
  rotationHours: number;
  tilt: number;
  orbit: OrbitalElements;
  intro: string;
  fact: string;
}

const orbit = (period: number, eccentricity = 0, inclination = 0, meanAnomaly = 0, periapsis = 0, node = 0): OrbitalElements => ({ period, eccentricity, inclination, meanAnomaly, periapsis, node });

// NASA/JPL J2000 elements, frozen for a simplified two-body educational model.
// Display radii and distances are independent educational scales, never physical units.
export const planets: CelestialBody[] = [
  { id: 'mercury', name: 'Mercúrio', kind: 'planet', subtitle: 'O pequeno veloz', color: '#b1aca4', texture: 'mercury', radius: .48, distance: 6.5, diameter: 4879, distanceKm: 57.9e6, rotationHours: 1407.6, tilt: .034, orbit: orbit(87.969, .20563593, 7.004979, 174.792527, 29.12703, 48.330766), intro: 'Sou o menor planeta e o vizinho mais próximo do Sol. Dou uma volta nele bem rapidinho!', fact: 'Meu ano tem só 88 dias da Terra. E eu não tenho nenhuma lua!' },
  { id: 'venus', name: 'Vênus', kind: 'planet', subtitle: 'O mundo das nuvens', color: '#e1b478', texture: 'venus', radius: .72, distance: 9, diameter: 12104, distanceKm: 108.2e6, rotationHours: -5832.5, tilt: 2.64, orbit: orbit(224.701, .00677672, 3.394676, 50.376632, 54.922625, 76.679843), intro: 'Estou coberto de nuvens bem grossas. Sou o planeta mais quente, mesmo sem ser o mais perto do Sol.', fact: 'Giro ao contrário da maioria dos planetas. Uma rotação minha demora mais que meu ano!' },
  { id: 'earth', name: 'Terra', kind: 'planet', subtitle: 'Nosso pequeno lar azul', color: '#6bafd8', texture: 'earth', radius: .78, distance: 12, diameter: 12756, distanceKm: 149.6e6, rotationHours: 23.9345, tilt: 23.44, orbit: orbit(365.256, .01671123, 0, -2.47311, 102.93768), intro: 'É aqui que a gente mora! Tenho oceanos, florestas e uma companheira muito especial: a Lua.', fact: 'A água cobre cerca de 71% da minha superfície. Sou o único planeta onde já encontramos vida.' },
  { id: 'mars', name: 'Marte', kind: 'planet', subtitle: 'O planeta vermelho', color: '#d5896b', texture: 'mars', radius: .60, distance: 15.5, diameter: 6792, distanceKm: 227.9e6, rotationHours: 24.6229, tilt: 25.19, orbit: orbit(686.98, .0933941, 1.849691, 19.390198, -73.503168, 49.559539), intro: 'Minha poeira avermelhada me dá esse apelido. Robôs exploradores passeiam por aqui!', fact: 'Tenho duas luas pequeninas: Fobos e Deimos. Elas parecem batatas espaciais!' },
  { id: 'jupiter', name: 'Júpiter', kind: 'planet', subtitle: 'O gigante da turma', color: '#d4b092', texture: 'jupiter', radius: 1.85, distance: 23, diameter: 142984, distanceKm: 778.6e6, rotationHours: 9.925, tilt: 3.13, orbit: orbit(4332.589, .04838624, 1.304397, 19.667961, -85.745429, 100.473909), intro: 'Sou o maior planeta do Sistema Solar! Minhas faixas são nuvens e minha mancha vermelha é uma tempestade.', fact: 'Minhas quatro grandes luas são Io, Europa, Ganimedes e Calisto. Ganimedes é maior que Mercúrio!' },
  { id: 'saturn', name: 'Saturno', kind: 'planet', subtitle: 'O senhor dos anéis', color: '#d4c19a', texture: 'saturn', radius: 1.55, distance: 29.5, diameter: 120536, distanceKm: 1433.5e6, rotationHours: 10.7, tilt: 26.73, orbit: orbit(10759.22, .05386179, 2.485992, -42.644634, -21.063546, 113.662424), intro: 'Olha só meus anéis! Eles são feitos de muitos pedacinhos de gelo e de rocha, de vários tamanhos.', fact: 'Minha lua Titã tem uma atmosfera espessa. Encélado lança jatos de água e gelo para o espaço!' },
  { id: 'uranus', name: 'Urano', kind: 'planet', subtitle: 'O planeta deitado', color: '#91cbd0', texture: 'uranus', radius: 1.10, distance: 36, diameter: 51118, distanceKm: 2872.5e6, rotationHours: 17.24, tilt: 97.77, orbit: orbit(30685.4, .04725744, .772638, 142.283828, 96.937351, 74.016925), intro: 'Sou um gigante gelado azul-esverdeado. Meu eixo é tão inclinado que pareço rolar de lado!', fact: 'Uma volta minha ao redor do Sol demora cerca de 84 anos da Terra.' },
  { id: 'neptune', name: 'Netuno', kind: 'planet', subtitle: 'A última parada', color: '#6085dc', texture: 'neptune', radius: 1.04, distance: 42, diameter: 49528, distanceKm: 4495.1e6, rotationHours: 16.11, tilt: 28.32, orbit: orbit(60189, .00859048, 1.770043, -100.084792, -86.819463, 131.784226), intro: 'Sou o planeta mais distante do Sol. Aqui faz muito frio e os ventos são superfortes!', fact: 'Tritão é minha maior lua. Ela orbita no sentido contrário à minha rotação.' },
];

export const sun: CelestialBody = { id: 'sun', name: 'Sol', kind: 'star', subtitle: 'A estrela da nossa aventura', color: '#ffbe62', texture: 'sun', radius: 2.9, distance: 0, diameter: 1392700, distanceKm: 0, rotationHours: 609.12, tilt: 7.25, orbit: orbit(1), intro: 'Olá, explorador! Sou a estrela que ilumina e aquece todos esses mundos. Vamos conhecer meus vizinhos?', fact: 'Minha luz leva cerca de 8 minutos para chegar à Terra. Todas as estrelas que você vê no céu também são sóis distantes!' };

function moon(id: string, name: string, parent: string, diameter: number, distanceKm: number, period: number, color: string, fact: string, index: number, eccentricity = 0, inclination = 0): CelestialBody {
  return { id, name, parent, kind: 'moon', subtitle: `Uma companheira de ${planets.find(p => p.id === parent)!.name}`, color, texture: id === 'moon' ? 'moon' : undefined, radius: .35 + Math.min(diameter / 6000, .55), distance: 6 + index * 3.5, diameter, distanceKm, rotationHours: Math.abs(period) * 24, tilt: 0, orbit: orbit(Math.abs(period), eccentricity, inclination, index * 93 + 25), intro: `Sou ${name}, uma lua de ${planets.find(p => p.id === parent)!.name}. Venha descobrir o que me torna especial!`, fact };
}

export const moons: CelestialBody[] = [
  moon('moon', 'Lua', 'earth', 3474.8, 384400, 27.321661, '#c9c9c5', 'Mostro sempre o mesmo lado para a Terra, porque minha rotação e minha volta ao redor dela levam o mesmo tempo.', 0, .0549, 5.145),
  moon('phobos', 'Fobos', 'mars', 22.2, 9376, .31891, '#b5a594', 'Sou uma lua pequena e irregular. Dou mais de três voltas em Marte a cada dia da Terra!', 0, .0151),
  moon('deimos', 'Deimos', 'mars', 12.4, 23463, 1.26244, '#a69987', 'Sou menor que Fobos e orbito mais longe de Marte. Minha forma é irregular, como uma pedrinha.', 1, .00033),
  moon('io', 'Io', 'jupiter', 3643.2, 421800, 1.769138, '#d9bd58', 'Sou o mundo com a maior atividade vulcânica do Sistema Solar!', 0, .0041),
  moon('europa', 'Europa', 'jupiter', 3121.6, 671100, 3.551181, '#d8c9aa', 'Minha superfície é de gelo. As evidências indicam um oceano enorme escondido por baixo dela!', 1, .0094),
  moon('ganymede', 'Ganimedes', 'jupiter', 5262.4, 1070400, 7.154553, '#a59787', 'Sou a maior lua do Sistema Solar, ainda maior que o planeta Mercúrio!', 2, .0013),
  moon('callisto', 'Calisto', 'jupiter', 4820.6, 1882700, 16.689018, '#89827b', 'Minha superfície tem muitas crateras antigas. Cada uma conta um pedacinho da história do espaço.', 3, .0074),
  moon('enceladus', 'Encélado', 'saturn', 504.2, 238400, 1.370218, '#d8e7eb', 'Lanço jatos de água e gelo! Tenho um oceano escondido sob minha superfície congelada.', 0, .0047),
  moon('rhea', 'Reia', 'saturn', 1527.6, 527100, 4.518212, '#b4b3ac', 'Sou a segunda maior lua de Saturno e tenho muitas crateras no gelo.', 1, .001),
  moon('titan', 'Titã', 'saturn', 5149.5, 1221900, 15.945421, '#d6a254', 'Tenho nuvens, rios e lagos. Mas meus lagos são de metano e etano, e não de água!', 2, .0288),
  moon('miranda', 'Miranda', 'uranus', 471.6, 129900, 1.413479, '#b6bab8', 'Minha superfície parece uma colcha de retalhos, com enormes penhascos.', 0, .0013),
  moon('titania', 'Titânia', 'uranus', 1577.8, 436300, 8.705872, '#bdafa5', 'Sou a maior lua de Urano. Tenho vales gigantes e muitas crateras.', 1, .0011),
  moon('oberon', 'Oberon', 'uranus', 1522.8, 583500, 13.463239, '#a6a09a', 'Sou uma lua escura e cheia de crateras. Meu nome veio de uma peça de teatro!', 2, .0014),
  moon('triton', 'Tritão', 'neptune', 2706.8, 354759, 5.876854, '#c3c3c5', 'Orb ito no sentido contrário à rotação de Netuno. Talvez eu tenha sido capturado por ele há muito tempo!'.replace('Orb ito', 'Orbito'), 0, .000016, 156.865),
];

export const bodies = [sun, ...planets, ...moons];
export const bodyById = Object.fromEntries(bodies.map(b => [b.id, b])) as Record<string, CelestialBody>;
export const moonsOf = (id: string) => moons.filter(m => m.parent === id);
export const formatNumber = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
export function formatPeriod(days: number): string {
  if (days < 1) return `${formatNumber(days * 24)} horas`;
  if (days < 700) return `${formatNumber(days)} dias`;
  return `${formatNumber(days / 365.256)} anos`;
}
