// Прив'язка 3D-моделей (STEP+GLB) до товарів за артикулом (sku). Файли — на сервері в /uploads/3d/.
// Ключ — sku, а не slug: адреса сторінки змінюється (перейменування, перенесення в іншу категорію),
// і модель мовчки зникала (так APE 25/60/180 втратив модель після виправлення слагу «…-kopyrovat»).
// Файли моделей названо за старими слагами — це лише імена файлів, на прив'язку не впливають.
// Згенеровано з «Маппінг 3D-моделей.xlsx». Важкі STEP/GLB не в git (том /uploads).
export const MODELS_BY_SKU = {
  // Колектори з нерж. сталі з витратомірами TJ-W-02..15 — індивідуальні моделі за к-стю контурів
  // (2026-06-29: STEP 2–12 WAY з теки «tj 3D/TJRW TJW/Flowmeter»; 13–15 поки на спільній моделі)
  "84040TJ-W-02": [{ file: 'kolektor-tj-w-02.step', name: '84040TJ-W-02.step', size: '18 МБ', glb: '/uploads/3d/kolektor-tj-w-02.glb' }],
  "84040TJ-W-03": [{ file: 'kolektor-tj-w-03.step', name: '84040TJ-W-03.step', size: '18 МБ', glb: '/uploads/3d/kolektor-tj-w-03.glb' }],
  "84040TJ-W-04": [{ file: 'kolektor-tj-w-04.step', name: '84040TJ-W-04.step', size: '14 МБ', glb: '/uploads/3d/kolektor-tj-w-04.glb' }],
  "84040TJ-W-05": [{ file: 'kolektor-tj-w-05.step', name: '84040TJ-W-05.step', size: '18 МБ', glb: '/uploads/3d/kolektor-tj-w-05.glb' }],
  "84040TJ-W-06": [{ file: 'kolektor-tj-w-06.step', name: '84040TJ-W-06.step', size: '18 МБ', glb: '/uploads/3d/kolektor-tj-w-06.glb' }],
  "84040TJ-W-07": [{ file: 'kolektor-tj-w-07.step', name: '84040TJ-W-07.step', size: '19 МБ', glb: '/uploads/3d/kolektor-tj-w-07.glb' }],
  "84040TJ-W-08": [{ file: 'kolektor-tj-w-08.step', name: '84040TJ-W-08.step', size: '19 МБ', glb: '/uploads/3d/kolektor-tj-w-08.glb' }],
  "84040TJ-W-09": [{ file: 'kolektor-tj-w-09.step', name: '84040TJ-W-09.step', size: '19 МБ', glb: '/uploads/3d/kolektor-tj-w-09.glb' }],
  "84040TJ-W-10": [{ file: 'kolektor-tj-w-10.step', name: '84040TJ-W-10.step', size: '19 МБ', glb: '/uploads/3d/kolektor-tj-w-10.glb' }],
  "84040TJ-W-11": [{ file: 'kolektor-tj-w-11.step', name: '84040TJ-W-11.step', size: '19 МБ', glb: '/uploads/3d/kolektor-tj-w-11.glb' }],
  "84040TJ-W-12": [{ file: 'kolektor-tj-w-12.step', name: '84040TJ-W-12.step', size: '15 МБ', glb: '/uploads/3d/kolektor-tj-w-12.glb' }],
  "84040TJ-W-13": [{ file: 'kolektor-tj-w-vytratomiry.step', name: '84040TJ-W-13.step', size: '14 МБ', glb: '/uploads/3d/kolektor-tj-w-vytratomiry.glb' }],
  "84040TJ-W-14": [{ file: 'kolektor-tj-w-vytratomiry.step', name: '84040TJ-W-14.step', size: '14 МБ', glb: '/uploads/3d/kolektor-tj-w-vytratomiry.glb' }],
  "84040TJ-W-15": [{ file: 'kolektor-tj-w-vytratomiry.step', name: '84040TJ-W-15.step', size: '14 МБ', glb: '/uploads/3d/kolektor-tj-w-vytratomiry.glb' }],
  "RMV03100-100": [{ file: '3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1.step', name: 'RMV03100-100.step', size: '7 МБ', glb: '/uploads/3d/3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1.glb' }],
  "RMV03100-112": [{ file: '3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1-1-2.step', name: 'RMV03100-112.step', size: '7 МБ', glb: '/uploads/3d/3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1-1-2.glb' }],
  "RMV03100-114": [{ file: '3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1-1-4.step', name: 'RMV03100-114.step', size: '6 МБ', glb: '/uploads/3d/3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-1-1-4.glb' }],
  "RMV03100-200": [{ file: '3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-2.step', name: 'RMV03100-200.step', size: '6 МБ', glb: '/uploads/3d/3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-2.glb' }],
  "RMV03100-034": [{ file: '3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-3-4.step', name: 'RMV03100-034.step', size: '7 МБ', glb: '/uploads/3d/3-h-hodovyj-klapan-z-vnutrishnoyu-rizboyu-3-4.glb' }],
  "84040492": [{ file: '84040492.step', name: 'К41ВН.125(100).step', size: '11 МБ', glb: '/uploads/3d/84040492.glb' }],
  "TJ413": [{ file: 'elektropryvid-keruvannya-postijnoyu-temperaturoyu-pro400.step', name: 'TJ413.step', size: '7 МБ', glb: '/uploads/3d/elektropryvid-keruvannya-postijnoyu-temperaturoyu-pro400.glb' }],
  "84040030": [{ file: 'gidravlichnyj-rozdilyuvach-gs-28.step', name: 'ГС-30 (1).step', size: '17 МБ', glb: '/uploads/3d/gidravlichnyj-rozdilyuvach-gs-28.glb' }, { file: 'gidravlichnyj-rozdilyuvach-gs-28-2.step', name: 'ГС-30 (2).step', size: '18 МБ', glb: '/uploads/3d/gidravlichnyj-rozdilyuvach-gs-28-2.glb' }],
  "84040025": [{ file: 'gidrostrilka-gs-25-v-izolyacziyi.step', name: 'ГС-25.step', size: '9 МБ', glb: '/uploads/3d/gidrostrilka-gs-25-v-izolyacziyi.glb' }],
  "84040026": [{ file: 'gidrostrilka-gs-26-v-izolyacziyi.step', name: 'ГС-26.step', size: '9 МБ', glb: '/uploads/3d/gidrostrilka-gs-26-v-izolyacziyi.glb' }],
  "84040027": [{ file: 'gidrostrilka-gs-27-v-izolyacziyi.step', name: 'ГС-27.step', size: '9 МБ', glb: '/uploads/3d/gidrostrilka-gs-27-v-izolyacziyi.glb' }],
  "84040028": [{ file: 'gidrostrilka-gs-28-v-izolyacziyi.step', name: 'ГС-28.step', size: '8 МБ', glb: '/uploads/3d/gidrostrilka-gs-28-v-izolyacziyi.glb' }],
  "84040031": [{ file: 'gidrostrilka-gs-31.step', name: 'ГС-31 (1).step', size: '9 МБ', glb: '/uploads/3d/gidrostrilka-gs-31.glb' }, { file: 'gidrostrilka-gs-31-2.step', name: 'ГС-31 (2).step', size: '12 МБ', glb: '/uploads/3d/gidrostrilka-gs-31-2.glb' }],
  "84040032": [{ file: 'gidrostrilka-gs-32.step', name: 'ГС-32 (1).step', size: '12 МБ', glb: '/uploads/3d/gidrostrilka-gs-32.glb' }, { file: 'gidrostrilka-gs-32-2.step', name: 'ГС-32 (2).step', size: '13 МБ', glb: '/uploads/3d/gidrostrilka-gs-32-2.glb' }],
  "84040033": [{ file: 'gidrostrilka-gs-33.step', name: 'ГС-33 (1).step', size: '14 МБ', glb: '/uploads/3d/gidrostrilka-gs-33.glb' }, { file: 'gidrostrilka-gs-33-2.step', name: 'ГС-33 (2).step', size: '14 МБ', glb: '/uploads/3d/gidrostrilka-gs-33-2.glb' }],
  "84040034": [{ file: 'gidrostrilka-gs-34.step', name: 'ГС-34 (1).step', size: '12 МБ', glb: '/uploads/3d/gidrostrilka-gs-34.glb' }, { file: 'gidrostrilka-gs-34-2.step', name: 'ГС-34 (2).step', size: '13 МБ', glb: '/uploads/3d/gidrostrilka-gs-34-2.glb' }],
  "84030720": [{ file: 'grupa-pompowa-gp-72-2.step', name: 'НГ-72.250 Л.step', size: '70 МБ', glb: '/uploads/3d/grupa-pompowa-gp-72-2.glb' }],
  "84040291": [{ file: 'k21v-12580-kolektor-v-teploizolyatsiyi-2-vhoru-staryy-art-sk-291-125-mini.step', name: 'К21В.125(80).step', size: '10 МБ', glb: '/uploads/3d/k21v-12580-kolektor-v-teploizolyatsiyi-2-vhoru-staryy-art-sk-291-125-mini.glb' }],
  "84040391": [{ file: 'k31v-12580-kolektor-v-teploizolyatsiyi-2-vhoru-1-vnyz-staryy-art-sk-391-125-mini.step', name: 'К31В.125(80).step', size: '11 МБ', glb: '/uploads/3d/k31v-12580-kolektor-v-teploizolyatsiyi-2-vhoru-1-vnyz-staryy-art-sk-391-125-mini.glb' }],
  "84040491": [{ file: 'k41v-12580-kolektor-v-teploizolyatsiyi-3-vhoru-1-vnyz-staryy-art-sk-491-125-mini.step', name: 'К41В.125(80).step', size: '12 МБ', glb: '/uploads/3d/k41v-12580-kolektor-v-teploizolyatsiyi-3-vhoru-1-vnyz-staryy-art-sk-491-125-mini.glb' }],
  "84040272": [{ file: 'k42gd125-200.step', name: 'К42ВН.125(200).step', size: '5 МБ', glb: '/uploads/3d/k42gd125-200.glb' }],
  "84040591": [{ file: 'k51v-12580-kolektor-v-teploizolyatsiyi-3-vhoru-2-vnyz-staryy-art-sk-591-125-mini.step', name: 'К51В.125(80).step', size: '12 МБ', glb: '/uploads/3d/k51v-12580-kolektor-v-teploizolyatsiyi-3-vhoru-2-vnyz-staryy-art-sk-591-125-mini.glb' }],
  "84040221": [{ file: 'khs22v-125150-kolektor-v-teploizolyatsiyi-2-vhoru-1-bokovyy-staryy-art-sk-221-12.step', name: 'КГС22В.125(150).step', size: '9 МБ', glb: '/uploads/3d/khs22v-125150-kolektor-v-teploizolyatsiyi-2-vhoru-1-bokovyy-staryy-art-sk-221-12.glb' }],
  "84040181": [{ file: 'khs22vn-125150-kolektor-v-teploizolyatsiyi-1-vhoru-vnyz-1-bokovyy-staryy-art-sk-.step', name: 'КГС22ВН.125(150).step', size: '8 МБ', glb: '/uploads/3d/khs22vn-125150-kolektor-v-teploizolyatsiyi-1-vhoru-vnyz-1-bokovyy-staryy-art-sk-.glb' }],
  "84040331": [{ file: 'khs32n-125150-kolektor-v-teploizolyatsiyi-3-vnyz-1-bokovyy-staryy-art-sk-331-125.step', name: 'КГС32Н.125(150).step', size: '9 МБ', glb: '/uploads/3d/khs32n-125150-kolektor-v-teploizolyatsiyi-3-vnyz-1-bokovyy-staryy-art-sk-331-125.glb' }],
  "84040281": [{ file: 'khs42vn-125150-kolektor-v-teploizolyatsiyi-4-1-vhoru-vnyz-staryy-art-sk-281-125-.step', name: 'КГС42ВН.125(150).step', size: '9 МБ', glb: '/uploads/3d/khs42vn-125150-kolektor-v-teploizolyatsiyi-4-1-vhoru-vnyz-staryy-art-sk-281-125-.glb' }],
  "84040281250": [{ file: 'kolektor-hydrauliczny-na-2-obwody-km281.step', name: '84040281250.step', size: '23 МБ', glb: '/uploads/3d/kolektor-hydrauliczny-na-2-obwody-km281.glb' }],
  "84040381250": [{ file: 'kolektor-hydrauliczny-na-3-obwody-km381.step', name: '84040381250.step', size: '24 МБ', glb: '/uploads/3d/kolektor-hydrauliczny-na-3-obwody-km381.glb' }],
  "84040392": [{ file: 'kolektor-k21v-125.step', name: 'К31ВН.125(100) (1).step', size: '10 МБ', glb: '/uploads/3d/kolektor-k21v-125.glb' }, { file: 'kolektor-k21v-125-2.step', name: 'К31ВН.125(100) (2).step', size: '10 МБ', glb: '/uploads/3d/kolektor-k21v-125-2.glb' }, { file: 'kolektor-k21v-125-3.step', name: 'К31ВН.125(100) (3).step', size: '10 МБ', glb: '/uploads/3d/kolektor-k21v-125-3.glb' }],
  "84040242": [{ file: 'kolektor-k22n-125-240-2.step', name: 'К22Н.125(200).step', size: '5 МБ', glb: '/uploads/3d/kolektor-k22n-125-240-2.glb' }],
  "84040263": [{ file: 'kolektor-k22n-150-300.step', name: 'К22Н.150(300).step', size: '19 МБ', glb: '/uploads/3d/kolektor-k22n-150-300.glb' }],
  "84040212": [{ file: 'kolektor-k22v-125-200.step', name: 'К22В.125(200).step', size: '5 МБ', glb: '/uploads/3d/kolektor-k22v-125-200.glb' }],
  "84040253": [{ file: 'kolektor-k22v-150-300.step', name: 'К22В.150(300).step', size: '19 МБ', glb: '/uploads/3d/kolektor-k22v-150-300.glb' }],
  "84040172": [{ file: 'kolektor-k22vn-125-200.step', name: 'К22ВН.125(200).step', size: '4 МБ', glb: '/uploads/3d/kolektor-k22vn-125-200.glb' }],
  "84040173": [{ file: 'kolektor-k22vn-150-300.step', name: 'К22ВН.150(300).step', size: '16 МБ', glb: '/uploads/3d/kolektor-k22vn-150-300.glb' }],
  "84040592": [{ file: 'kolektor-k31v-125.step', name: 'К51ВН.125(100).step', size: '12 МБ', glb: '/uploads/3d/kolektor-k31v-125.glb' }],
  "84040342": [{ file: 'kolektor-k32n-125-200.step', name: 'К32Н.125(200).step', size: '22 МБ', glb: '/uploads/3d/kolektor-k32n-125-200.glb' }],
  "84040363": [{ file: 'kolektor-k32n-150-300.step', name: 'К32Н.150(300).step', size: '22 МБ', glb: '/uploads/3d/kolektor-k32n-150-300.glb' }],
  "84040312": [{ file: 'kolektor-k32v-125-200.step', name: 'К32В.125(200).step', size: '6 МБ', glb: '/uploads/3d/kolektor-k32v-125-200.glb' }],
  "84040353": [{ file: 'kolektor-k32v-150-300.step', name: 'К32В.150(300).step', size: '22 МБ', glb: '/uploads/3d/kolektor-k32v-150-300.glb' }],
  "84040442": [{ file: 'kolektor-k42n-125-200.step', name: 'К42Н.125(200).step', size: '25 МБ', glb: '/uploads/3d/kolektor-k42n-125-200.glb' }],
  "84040463": [{ file: 'kolektor-k42n-150-300.step', name: 'К42Н.150(300).step', size: '27 МБ', glb: '/uploads/3d/kolektor-k42n-150-300.glb' }],
  "84040412": [{ file: 'kolektor-k42v-125-200.step', name: 'К42В.125(200).step', size: '25 МБ', glb: '/uploads/3d/kolektor-k42v-125-200.glb' }],
  "84040453": [{ file: 'kolektor-k42v-150-300.step', name: 'К42В.150(300).step', size: '26 МБ', glb: '/uploads/3d/kolektor-k42v-150-300.glb' }],
  "84040273": [{ file: 'kolektor-k42vn-150-300.step', name: 'К42ВН.150(300).step', size: '20 МБ', glb: '/uploads/3d/kolektor-k42vn-150-300.glb' }],
  "84040542": [{ file: 'kolektor-k52n-125-200.step', name: 'К52Н.125(200).step', size: '29 МБ', glb: '/uploads/3d/kolektor-k52n-125-200.glb' }],
  "84040563": [{ file: 'kolektor-k52n-150-300.step', name: 'К52Н.150(300).step', size: '29 МБ', glb: '/uploads/3d/kolektor-k52n-150-300.glb' }],
  "84040512": [{ file: 'kolektor-k52v-125-200.step', name: 'К52В.125(200).step', size: '29 МБ', glb: '/uploads/3d/kolektor-k52v-125-200.glb' }],
  "84040553": [{ file: 'kolektor-k52v-150-300.step', name: 'К52В.150(300).step', size: '29 МБ', glb: '/uploads/3d/kolektor-k52v-150-300.glb' }],
  "84040373": [{ file: 'kolektor-k62vn-150-300.step', name: 'К62ВН.150(300) (1).step', size: '24 МБ', glb: '/uploads/3d/kolektor-k62vn-150-300.glb' }, { file: 'kolektor-k62vn-150-300-2.step', name: 'К62ВН.150(300) (2).step', size: '24 МБ', glb: '/uploads/3d/kolektor-k62vn-150-300-2.glb' }],
  "84040472": [{ file: 'kolektor-k82vn-125-200.step', name: 'К82ВН.125(200).step', size: '28 МБ', glb: '/uploads/3d/kolektor-k82vn-125-200.glb' }],
  "84040473": [{ file: 'kolektor-k82vn-150-300.step', name: 'К82ВН.150(300).step', size: '28 МБ', glb: '/uploads/3d/kolektor-k82vn-150-300.glb' }],
  "84040232": [{ file: 'kolektor-kgs22n-125-200.step', name: 'КГС22Н.125(200).step', size: '21 МБ', glb: '/uploads/3d/kolektor-kgs22n-125-200.glb' }],
  "84040182": [{ file: 'kolektor-kgs22vn-125-200.step', name: 'КГС22ВН.125(200).step', size: '19 МБ', glb: '/uploads/3d/kolektor-kgs22vn-125-200.glb' }],
  "84040332": [{ file: 'kolektor-kgs32n-125-200.step', name: 'КГС32Н.125(200).step', size: '24 МБ', glb: '/uploads/3d/kolektor-kgs32n-125-200.glb' }],
  "84040432": [{ file: 'kolektor-kgs42n-125-200.step', name: 'КГС42Н.125(200).step', size: '27 МБ', glb: '/uploads/3d/kolektor-kgs42n-125-200.glb' }],
  "84040422": [{ file: 'kolektor-kgs42v-125-200.step', name: 'КГС42В.125(200).step', size: '27 МБ', glb: '/uploads/3d/kolektor-kgs42v-125-200.glb' }],
  "84040282": [{ file: 'kolektor-kgs42vn-125-200.step', name: 'КГС42ВН.125(200).step', size: '23 МБ', glb: '/uploads/3d/kolektor-kgs42vn-125-200.glb' }],
  "84040532": [{ file: 'kolektor-kgs52n-125-200.step', name: 'КГС52Н.125(200).step', size: '30 МБ', glb: '/uploads/3d/kolektor-kgs52n-125-200.glb' }],
  "84040382": [{ file: 'kolektor-kgs62vn-125-200.step', name: 'КГС62ВН.125(200).step', size: '20 МБ', glb: '/uploads/3d/kolektor-kgs62vn-125-200.glb' }],
  "84040482": [{ file: 'kolektor-kgs82vn-125-200.step', name: 'КГС82ВН.125(200).step', size: '30 МБ', glb: '/uploads/3d/kolektor-kgs82vn-125-200.glb' }],
  "84040271": [{ file: 'kolektor-na-2-vyhoda.step', name: '84040271.step', size: '22 МБ', glb: '/uploads/3d/kolektor-na-2-vyhoda.glb' }],
  "84040371": [{ file: 'kolektor-na-3-vyhoda.step', name: '84040371.step', size: '23 МБ', glb: '/uploads/3d/kolektor-na-3-vyhoda.glb' }],
  "84040222": [{ file: 'kollektor-kgs22v-125-200.step', name: 'КГС22В.125(200).step', size: '21 МБ', glb: '/uploads/3d/kollektor-kgs22v-125-200.glb' }],
  "84040322": [{ file: 'kollektor-kgs32v-125-200.step', name: 'КГС32В.125(200).step', size: '24 МБ', glb: '/uploads/3d/kollektor-kgs32v-125-200.glb' }],
  "84040522": [{ file: 'kollektor-kgs52v-125-200.step', name: 'КГС52В.125(200).step', size: '30 МБ', glb: '/uploads/3d/kollektor-kgs52v-125-200.glb' }],
  "30328018": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.step', name: '30328018.step', size: '16 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.glb' }],
  "30501228": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30651234": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.step', name: '30651234.step', size: '18 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.glb' }],
  "30254013": [{ file: 'nasos-termojet-auto-ape-25-40-130mm.step', name: '30254013.step', size: '15 МБ', glb: '/uploads/3d/nasos-termojet-auto-ape-25-40-130mm.glb' }],
  "30321218": [{ file: 'nasos-termojet-auto-apm-32-12-180mm.step', name: '30321218.step', size: '20 МБ', glb: '/uploads/3d/nasos-termojet-auto-apm-32-12-180mm.glb' }],
  "84300460": [{ file: 'ng-46-z-termokranom-1.step', name: 'НГ-46 (26) Л.step', size: '50 МБ', glb: '/uploads/3d/ng-46-z-termokranom-1.glb' }],
  "84600460": [{ file: 'ng-46p-z-termokranom-1.step', name: 'НГ-46 (26).step', size: '50 МБ', glb: '/uploads/3d/ng-46p-z-termokranom-1.glb' }],
  "84300470": [{ file: 'ng-47-bez-zmishuvacha-1.step', name: 'НГ-47 (27) Л.step', size: '45 МБ', glb: '/uploads/3d/ng-47-bez-zmishuvacha-1.glb' }],
  "84600470": [{ file: 'ng-47p-bez-zmishuvacha-1.step', name: 'НГ-47 (27).step', size: '45 МБ', glb: '/uploads/3d/ng-47p-bez-zmishuvacha-1.glb' }],
  "84320480": [{ file: 'ng-48-zi-zmishuvachem-1.step', name: 'НГ-48 (28) Л.step', size: '53 МБ', glb: '/uploads/3d/ng-48-zi-zmishuvachem-1.glb' }],
  "84620480": [{ file: 'ng-48p-zi-zmishuvachem-1.step', name: 'НГ-48 (28).step', size: '53 МБ', glb: '/uploads/3d/ng-48p-zi-zmishuvachem-1.glb' }],
  "84300510": [{ file: 'ng-51-bez-zmishuvacha-1-1-4.step', name: 'НГ-51.150-Л.step', size: '49 МБ', glb: '/uploads/3d/ng-51-bez-zmishuvacha-1-1-4.glb' }],
  "84600510": [{ file: 'ng-51p-bez-zmishuvacha-1-1-4.step', name: 'НГ-51.150.step', size: '48 МБ', glb: '/uploads/3d/ng-51p-bez-zmishuvacha-1-1-4.glb' }],
  "84312520": [{ file: 'ng-52-zi-zmishuvachem-1-1-4.step', name: 'НГ-52.150 Л.step', size: '54 МБ', glb: '/uploads/3d/ng-52-zi-zmishuvachem-1-1-4.glb' }],
  "84612520": [{ file: 'ng-52p-zi-zmishuvachem-1-1-4.step', name: 'НГ-52.150.step', size: '43 МБ', glb: '/uploads/3d/ng-52p-zi-zmishuvachem-1-1-4.glb' }],
  "84030610": [{ file: 'ng-61-bez-zmishuvacha-1-1-2.step', name: 'НГ-61.250.step', size: '53 МБ', glb: '/uploads/3d/ng-61-bez-zmishuvacha-1-1-2.glb' }],
  "84030620": [{ file: 'ng-62-zi-zmishuvachem-1-1-2.step', name: 'НГ-62.250.step', size: '61 МБ', glb: '/uploads/3d/ng-62-zi-zmishuvachem-1-1-2.glb' }],
  "84131670": [{ file: 'ng-67150-dlya-pidklyuchennya-bojlera-1.step', name: 'НГ-67.150 (1).step', size: '35 МБ', glb: '/uploads/3d/ng-67150-dlya-pidklyuchennya-bojlera-1.glb' }, { file: 'ng-67150-dlya-pidklyuchennya-bojlera-1-2.step', name: 'НГ-67.200 (2).step', size: '35 МБ', glb: '/uploads/3d/ng-67150-dlya-pidklyuchennya-bojlera-1-2.glb' }],
  "84030710": [{ file: 'ng-71-bez-zmishuvacha-2.step', name: 'НГ-71.250.step', size: '56 МБ', glb: '/uploads/3d/ng-71-bez-zmishuvacha-2.glb' }],
  "84030081": [{ file: 'ng-81-nasosna-hrupa-bez-zmishuvacha-du65-termojet-mega.step', name: 'НГ-81.step', size: '59 МБ', glb: '/uploads/3d/ng-81-nasosna-hrupa-bez-zmishuvacha-du65-termojet-mega.glb' }],
  "84030082": [{ file: 'nh-82-250-l-nasosna-hrupa-zi-zmishuvachem-2-1-2-vr-v-teploizolyatsiyi-bez-nasosa.step', name: 'НГ-82.250 Л.step', size: '71 МБ', glb: '/uploads/3d/nh-82-250-l-nasosna-hrupa-zi-zmishuvachem-2-1-2-vr-v-teploizolyatsiyi-bez-nasosa.glb' }],
  "84050115": [{ file: 'perehid-pid-nasosnu-grupu-1.step', name: '84050115.step', size: '12 МБ', glb: '/uploads/3d/perehid-pid-nasosnu-grupu-1.glb' }],
  "84050116": [{ file: 'perehid-pid-nasosnu-grupu-1-1-4.step', name: '84050116.step', size: '16 МБ', glb: '/uploads/3d/perehid-pid-nasosnu-grupu-1-1-4.glb' }],
  "84050121": [{ file: 'perehid-pid-svarku-40-40.step', name: '84050121.step', size: '1 МБ', glb: '/uploads/3d/perehid-pid-svarku-40-40.glb' }],
  "84050122": [{ file: 'perehid-pid-svarku-50-50.step', name: '84050122.step', size: '1 МБ', glb: '/uploads/3d/perehid-pid-svarku-50-50.glb' }],
  "AQUAO405-3-230-060": [{ file: 'pryvod-ra400.step', name: 'RA400.step', size: '6 МБ', glb: '/uploads/3d/pryvod-ra400.glb' }],

  // ── #1 (Етап 3): розподіл наявних 3D-моделей на схожі насоси/приводи за серією ──
  // APE-130 → джерело ape-25-40-130mm
  "30206013": [{ file: 'nasos-termojet-auto-ape-25-40-130mm.step', name: '30254013.step', size: '15 МБ', glb: '/uploads/3d/nasos-termojet-auto-ape-25-40-130mm.glb' }],
  "30256013": [{ file: 'nasos-termojet-auto-ape-25-40-130mm.step', name: '30254013.step', size: '15 МБ', glb: '/uploads/3d/nasos-termojet-auto-ape-25-40-130mm.glb' }],
  "30258013": [{ file: 'nasos-termojet-auto-ape-25-40-130mm.step', name: '30254013.step', size: '15 МБ', glb: '/uploads/3d/nasos-termojet-auto-ape-25-40-130mm.glb' }],
  // APE-180 → джерело ape-32-80-180-mm
  "30254018": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.step', name: '30328018.step', size: '16 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.glb' }],
  "30256018": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.step', name: '30328018.step', size: '16 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.glb' }],
  "30258018": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.step', name: '30328018.step', size: '16 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-32-80-180-mm.glb' }],
  // APM → джерело apm-32-12-180mm
  "30250818": [{ file: 'nasos-termojet-auto-apm-32-12-180mm.step', name: '30321218.step', size: '20 МБ', glb: '/uploads/3d/nasos-termojet-auto-apm-32-12-180mm.glb' }],
  "30251218": [{ file: 'nasos-termojet-auto-apm-32-12-180mm.step', name: '30321218.step', size: '20 МБ', glb: '/uploads/3d/nasos-termojet-auto-apm-32-12-180mm.glb' }],
  "30320818": [{ file: 'nasos-termojet-auto-apm-32-12-180mm.step', name: '30321218.step', size: '20 МБ', glb: '/uploads/3d/nasos-termojet-auto-apm-32-12-180mm.glb' }],
  "30321018": [{ file: 'nasos-termojet-auto-apm-32-12-180mm.step', name: '30321218.step', size: '20 МБ', glb: '/uploads/3d/nasos-termojet-auto-apm-32-12-180mm.glb' }],
  // APM-F 250/280 → джерело apm-50-12f-280-mm (220мм взято найближчу 280-модель)
  "30400822": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30401225": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30401525": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30401825": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30501028": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  // APM-F 50/8, 50/15, 50/18 (нові) → спільний GLB серії APM-F
  "30500824": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30501528": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  "30501828": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.step', name: '30501228.step', size: '24 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-50-12f-280-mm.glb' }],
  // APM-F 340 → джерело apm-65-12f-340-mm
  "30651034": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.step', name: '30651234.step', size: '18 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.glb' }],
  "30651534": [{ file: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.step', name: '30651234.step', size: '18 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-12f-340-mm.glb' }],
  // Приводи → джерело 405N (silownik-termojet-aqua401-60-sek) на 401/411/412
  "AQUAO401-3-230-120": [{ file: 'pryvod-ra400.step', name: 'RA400.step', size: '6 МБ', glb: '/uploads/3d/pryvod-ra400.glb' }],
  "AQUA411-0-10-24": [{ file: 'pryvod-ra400.step', name: 'RA400.step', size: '6 МБ', glb: '/uploads/3d/pryvod-ra400.glb' }],
  "AQUAO412-3-230-060": [{ file: 'pryvod-ra400.step', name: 'RA400.step', size: '6 МБ', glb: '/uploads/3d/pryvod-ra400.glb' }],

  // ── #2 (2026-06-05): нові 3D-моделі від постачальника (STEP+GLB на /uploads/3d/) ──
  // Рециркуляційні насоси SPE12
  "4535484": [{ file: 'nergozberigayuchi-reczyrkulyaczijni-nasosy-termojet-spe12-1-4.step', name: 'SPE12-1.4.step', size: '3 МБ', glb: '/uploads/3d/nergozberigayuchi-reczyrkulyaczijni-nasosy-termojet-spe12-1-4.glb?v=2' }],
  "4535487": [{ file: 'nergozberigayuchi-reczyrkulyaczijni-nasosy-termojet-spe12-1-4s.step', name: 'SPE12-1.4S.step', size: '3 МБ', glb: '/uploads/3d/nergozberigayuchi-reczyrkulyaczijni-nasosy-termojet-spe12-1-4s.glb?v=2' }],
  // Насос MEGA 100-120F
  "3310012045": [{ file: 'pump-mega100-120f-450.step', name: 'MEGA 100-120F.step', size: '41 МБ', glb: '/uploads/3d/pump-mega100-120f-450.glb?v=2' }],
  // Насоси підвищувальні SILENCER
  "SILENCER300": [{ file: 'pump-silencer300.step', name: 'SILENCER 300.step', size: '21 МБ', glb: '/uploads/3d/pump-silencer300.glb' }],
  "SILENCER900": [{ file: 'pump-silencer900.step', name: 'SILENCER 900.step', size: '21 МБ', glb: '/uploads/3d/pump-silencer900.glb' }],
  // Змішувальний вузол TJ-MU-10B (130mm)
  "TJ-MU-10B": [{ file: 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-10b.step', name: 'TJ-MU-10B.step', size: '44 МБ', glb: '/uploads/3d/zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-10b.glb' }],
  // 180mm → усі насосні групи EPP BLACK (спільна модель)
  "84610490": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84324480A": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84310490": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84610470": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84310470": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84622480": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84622480A": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],
  "84324480": [{ file: 'nasosna-hrupa-epp-black-180mm.step', name: 'НГ EPP BLACK.step', size: '38 МБ', glb: '/uploads/3d/nasosna-hrupa-epp-black-180mm.glb' }],

  // ── #3 (2026-06-06): каналізаційні станції GRANDLIFT (літраж = об'єм бака) ──
  "GL2075": [{ file: 'pump-grandlift-20-75sw.step', name: 'GRANDLIFT 20-75SW.step', size: '3 МБ', glb: '/uploads/3d/pump-grandlift-20-75sw.glb' }],
  "GL6075": [{ file: 'pump-grandlift-60-75sw.step', name: 'GRANDLIFT 60-75SW.step', size: '0.3 МБ', glb: '/uploads/3d/pump-grandlift-60-75sw.glb' }],
  "GL120220": [{ file: 'pump-grandlift-120-220sw.step', name: 'GRANDLIFT 120-220SW.step', size: '2 МБ', glb: '/uploads/3d/pump-grandlift-120-220sw.glb' }],
  "GL150370": [{ file: 'pump-grandlift-150-370dw.step', name: 'GRANDLIFT 150-370DW.step', size: '4 МБ', glb: '/uploads/3d/pump-grandlift-150-370dw.glb' }],

  // ── #4 (2026-06-08): папка «tj 3D» — насоси XPS/HBS, вузол TJ-MU-25, колектори TJ-R-W ──
  "38241225": [{ file: '38241225.step', name: 'HBS24-12.step', size: '6 МБ', glb: '/uploads/3d/38241225.glb' }],
  "33250613": [{ file: 'nasos-czyrkulyaczijnyj-termojet-xps-25-6-130.step', name: 'XPS25-6-130B.step', size: '15 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-xps-25-6-130.glb' }],
  "33250618": [{ file: 'nasos-czyrkulyaczijnyj-termojet-xps-25-6-180b.step', name: 'XPS25-8-180B.step', size: '5 МБ', glb: '/uploads/3d/nasos-czyrkulyaczijnyj-termojet-xps-25-6-180b.glb' }],
  "84040TJ-MU-25": [{ file: 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-25.step', name: 'TJ-MU-25.step', size: '41 МБ', glb: '/uploads/3d/zmishuvalnyj-vuzol-dlya-teployi-pidlogy-tj-mu-25.glb' }],
  // Колектори радіаторні TJ-R-W (з кранами, 2–12 виходів) — індивідуальні моделі за к-стю контурів
  // (2026-06-29: STEP з теки «tj 3D/TJRW TJW/Lockshield»)
  "84040TJ-R-W-02": [{ file: 'kolektor-tj-r-w-02.step', name: 'TJ-R-W-02.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-02.glb' }],
  "84040TJ-R-W-03": [{ file: 'kolektor-tj-r-w-03.step', name: 'TJ-R-W-03.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-03.glb' }],
  "84040TJ-R-W-04": [{ file: 'kolektor-tj-r-w-04.step', name: 'TJ-R-W-04.step', size: '14 МБ', glb: '/uploads/3d/kolektor-tj-r-w-04.glb' }],
  "84040TJ-R-W-05": [{ file: 'kolektor-tj-r-w-05.step', name: 'TJ-R-W-05.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-05.glb' }],
  "84040TJ-R-W-06": [{ file: 'kolektor-tj-r-w-06.step', name: 'TJ-R-W-06.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-06.glb' }],
  "84040TJ-R-W-07": [{ file: 'kolektor-tj-r-w-07.step', name: 'TJ-R-W-07.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-07.glb' }],
  "84040TJ-R-W-08": [{ file: 'kolektor-tj-r-w-08.step', name: 'TJ-R-W-08.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-08.glb' }],
  "84040TJ-R-W-09": [{ file: 'kolektor-tj-r-w-09.step', name: 'TJ-R-W-09.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-09.glb' }],
  "84040TJ-R-W-10": [{ file: 'kolektor-tj-r-w-10.step', name: 'TJ-R-W-10.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-10.glb' }],
  "84040TJ-R-W-11": [{ file: 'kolektor-tj-r-w-11.step', name: 'TJ-R-W-11.step', size: '16 МБ', glb: '/uploads/3d/kolektor-tj-r-w-11.glb' }],
  "84040TJ-R-W-12": [{ file: 'kolektor-tj-r-w-12.step', name: 'TJ-R-W-12.step', size: '12 МБ', glb: '/uploads/3d/kolektor-tj-r-w-12.glb' }],

  // ── #5 (2026-06-08): інлайн-насоси TBE (з папки «tj 3D») ──
  "3350242": [{ file: 'nasos-termojet-tbe-50-24-2.step', name: 'TBE 50-24-2.step', size: '7 МБ', glb: '/uploads/3d/nasos-termojet-tbe-50-24-2.glb' }],
  "3350362": [{ file: 'nasos-termojet-tbe-50-36-2.step', name: 'TBE 50-36-2.step', size: '9 МБ', glb: '/uploads/3d/nasos-termojet-tbe-50-36-2.glb' }],
  "3365342": [{ file: 'nasos-termojet-tbe-65-34-2.step', name: 'TBE 65-34-2.step', size: '10 МБ', glb: '/uploads/3d/nasos-termojet-tbe-65-34-2.glb' }],

  // ── #6 (2026-06-08): мультинасосні групи — модулі BOX2/BOX3 + насосні групи НГ-36/37/38/38А.
  //     STEP/GLB на сервері лежать у gzip (.step.gz/.glb.gz), nginx віддає прозоро (gzip_static).
  "84040BOX2": [{ file: 'modul-termojet-box2-v-teploizolyatsiyi-km2-ups.step', name: 'BOX-II.step', size: '113 МБ', glb: '/uploads/3d/modul-termojet-box2-v-teploizolyatsiyi-km2-ups.glb?v=2' }],
  "84040BOX3": [{ file: 'modul-termojet-box3-v-teploizolyatsiyi-km3-ups.step', name: 'BOX-III.step', size: '163 МБ', glb: '/uploads/3d/modul-termojet-box3-v-teploizolyatsiyi-km3-ups.glb?v=2' }],
  "84130390": [{ file: 'nh-36-z-termostatychnym-kranom.step', name: 'НГ-36.step', size: '42 МБ', glb: '/uploads/3d/nh-36-z-termostatychnym-kranom.glb?v=2' }],
  "84130370": [{ file: 'nh-37-pryama.step', name: 'НГ-37.step', size: '28 МБ', glb: '/uploads/3d/nh-37-pryama.glb?v=2' }],
  "84142380": [{ file: 'nh-38-zi-zmishuvachem.step', name: 'НГ-38.step', size: '32 МБ', glb: '/uploads/3d/nh-38-zi-zmishuvachem.glb?v=2' }],
  "84142380A": [{ file: '84142380a.step', name: 'НГ-38А.step', size: '38 МБ', glb: '/uploads/3d/84142380a.glb?v=2' }],

  // ── #7 (2026-06-09): сепаратори — одна 3D-модель на серію (TJVT6G комбіновані поки без 3D) ──
  // TJV6G повітря — модель 3/4" на всі DN20–50
  "TJV6G20": [{ file: 'sep-tjv6g-g34.step', name: 'TJV6G.step', size: '20 МБ', glb: '/uploads/3d/sep-tjv6g-g34.glb?v=2' }],
  "TJV6G25": [{ file: 'sep-tjv6g-g34.step', name: 'TJV6G.step', size: '20 МБ', glb: '/uploads/3d/sep-tjv6g-g34.glb?v=2' }],
  "TJV6G32": [{ file: 'sep-tjv6g-g34.step', name: 'TJV6G.step', size: '20 МБ', glb: '/uploads/3d/sep-tjv6g-g34.glb?v=2' }],
  "TJV6G40": [{ file: 'sep-tjv6g-g34.step', name: 'TJV6G.step', size: '20 МБ', glb: '/uploads/3d/sep-tjv6g-g34.glb?v=2' }],
  "TJV6G50": [{ file: 'sep-tjv6g-g34.step', name: 'TJV6G.step', size: '20 МБ', glb: '/uploads/3d/sep-tjv6g-g34.glb?v=2' }],
  // TJVT6G повітря+бруд (комбіновані) — модель 1¼" (файл sep-tjv6g-g114) на всі DN20–50
  "TJVT6G20": [{ file: 'sep-tjv6g-g114.step', name: 'TJVT6G.step', size: '40 МБ', glb: '/uploads/3d/sep-tjv6g-g114.glb?v=2' }],
  "TJVT6G25": [{ file: 'sep-tjv6g-g114.step', name: 'TJVT6G.step', size: '40 МБ', glb: '/uploads/3d/sep-tjv6g-g114.glb?v=2' }],
  "TJVT6G32": [{ file: 'sep-tjv6g-g114.step', name: 'TJVT6G.step', size: '40 МБ', glb: '/uploads/3d/sep-tjv6g-g114.glb?v=2' }],
  "TJVT6G40": [{ file: 'sep-tjv6g-g114.step', name: 'TJVT6G.step', size: '40 МБ', glb: '/uploads/3d/sep-tjv6g-g114.glb?v=2' }],
  "TJVT6G50": [{ file: 'sep-tjv6g-g114.step', name: 'TJVT6G.step', size: '40 МБ', glb: '/uploads/3d/sep-tjv6g-g114.glb?v=2' }],
  // TJV7G поворотний повітря
  "TJV7G20": [{ file: 'sep-tjv7g.step', name: 'TJV7G.step', size: '18 МБ', glb: '/uploads/3d/sep-tjv7g.glb?v=2' }],
  "TJV7G25": [{ file: 'sep-tjv7g.step', name: 'TJV7G.step', size: '18 МБ', glb: '/uploads/3d/sep-tjv7g.glb?v=2' }],
  "TJV7G32": [{ file: 'sep-tjv7g.step', name: 'TJV7G.step', size: '18 МБ', glb: '/uploads/3d/sep-tjv7g.glb?v=2' }],
  "TJV7G40": [{ file: 'sep-tjv7g.step', name: 'TJV7G.step', size: '18 МБ', glb: '/uploads/3d/sep-tjv7g.glb?v=2' }],
  // TJT6G бруд
  "TJT6G20": [{ file: 'sep-tjt6g.step', name: 'TJT6G.step', size: '24 МБ', glb: '/uploads/3d/sep-tjt6g.glb?v=2' }],
  "TJT6G25": [{ file: 'sep-tjt6g.step', name: 'TJT6G.step', size: '24 МБ', glb: '/uploads/3d/sep-tjt6g.glb?v=2' }],
  "TJT6G32": [{ file: 'sep-tjt6g.step', name: 'TJT6G.step', size: '24 МБ', glb: '/uploads/3d/sep-tjt6g.glb?v=2' }],
  "TJT6G40": [{ file: 'sep-tjt6g.step', name: 'TJT6G.step', size: '24 МБ', glb: '/uploads/3d/sep-tjt6g.glb?v=2' }],
  "TJT6G50": [{ file: 'sep-tjt6g.step', name: 'TJT6G.step', size: '24 МБ', glb: '/uploads/3d/sep-tjt6g.glb?v=2' }],
  // TJT7G бруд поворотний
  "TJT7G20": [{ file: 'sep-tjt7g.step', name: 'TJT7G.step', size: '44 МБ', glb: '/uploads/3d/sep-tjt7g.glb?v=2' }],
  "TJT7G25": [{ file: 'sep-tjt7g.step', name: 'TJT7G.step', size: '44 МБ', glb: '/uploads/3d/sep-tjt7g.glb?v=2' }],
  "TJT7G32": [{ file: 'sep-tjt7g.step', name: 'TJT7G.step', size: '44 МБ', glb: '/uploads/3d/sep-tjt7g.glb?v=2' }],
  "TJT7G40": [{ file: 'sep-tjt7g.step', name: 'TJT7G.step', size: '44 МБ', glb: '/uploads/3d/sep-tjt7g.glb?v=2' }],
  // TJ4F повітровідвідник
  "TJ4F15-10/110-15": [{ file: 'sep-tj4f.step', name: 'TJ4F.step', size: '5 МБ', glb: '/uploads/3d/sep-tj4f.glb?v=2' }],
  "TJ4F20-10/110-20": [{ file: 'sep-tj4f.step', name: 'TJ4F.step', size: '5 МБ', glb: '/uploads/3d/sep-tj4f.glb?v=2' }],
  "TJ4F25-10/110-25": [{ file: 'sep-tj4f.step', name: 'TJ4F.step', size: '5 МБ', glb: '/uploads/3d/sep-tj4f.glb?v=2' }],
  // TJ7590 антифризний клапан
  // 2026-07-31: замінено на нову версію з чорною Т-ручкою (STEP 7590100301, спільна на серію)
  "TJ7590100301": [{ file: 'sep-tj7590-v2.step', name: 'TJ7590.step', size: '5 МБ', glb: '/uploads/3d/sep-tj7590-v2.glb' }],
  "TJ7590100801": [{ file: 'sep-tj7590-v2.step', name: 'TJ7590.step', size: '5 МБ', glb: '/uploads/3d/sep-tj7590-v2.glb' }],
  // TJ5503 кран розширювального баку
  "TJ5503702401": [{ file: 'sep-tj5503.step', name: 'TJ5503.step', size: '13 МБ', glb: '/uploads/3d/sep-tj5503.glb' }],
  // TJ7575 сепаратор бруду для теплових насосів (пластиковий)
  "TJ7575055501": [{ file: 'sep-tj7575.step', name: 'TJ7575.step', size: '207 МБ', glb: '/uploads/3d/sep-tj7575.glb' }],
  // 2026-08-11: фланцеві гідрострілки ГС-31Ф…ГС-34Ф (моделі SG-3xM-F)
  "84040031F": [{ file: 'gidrostrilka-gs-31-f.step', name: 'SG-31M-F.step', size: '22 МБ', glb: '/uploads/3d/gidrostrilka-gs-31-f.glb' }],
  "84040032F": [{ file: 'gidrostrilka-gs-32-f.step', name: 'SG-32M-F.step', size: '25 МБ', glb: '/uploads/3d/gidrostrilka-gs-32-f.glb' }],
  "84040033F": [{ file: 'gidrostrilka-gs-33-f.step', name: 'SG-33M-F.step', size: '29 МБ', glb: '/uploads/3d/gidrostrilka-gs-33-f.glb' }],
  "84040034F": [{ file: 'gidrostrilka-gs-34-f.step', name: 'SG-34M-F.step', size: '31 МБ', glb: '/uploads/3d/gidrostrilka-gs-34-f.glb' }],
// Фланцеві сепаратори повітря (TJV8F) і бруду (TJT8F) Dn50…Dn100.
// Файли — у томі /uploads/3d/. Вставити у src/data/models3d.js всередину MODELS_BY_SLUG.
// (2026-08-11: у Dn50 бруду власної моделі немає — тимчасово на спільній із Dn65,
//  ім'я файла показуємо справжнє. Замінити, коли прийде модель Dn50.)
  "TJV8F50": [{ file: 'separator-as-dn50.step', name: 'TJV8F50.step', size: '4 МБ', glb: '/uploads/3d/separator-as-dn50.glb' }],
  "TJV8F65": [{ file: 'separator-as-dn65.step', name: 'TJV8F65.step', size: '4 МБ', glb: '/uploads/3d/separator-as-dn65.glb' }],
  "TJV8F80": [{ file: 'separator-as-dn80.step', name: 'TJV8F80.step', size: '3 МБ', glb: '/uploads/3d/separator-as-dn80.glb' }],
  "TJV8F100": [{ file: 'separator-as-dn100.step', name: 'TJV8F100.step', size: '3 МБ', glb: '/uploads/3d/separator-as-dn100.glb' }],
  "TJT8F50": [{ file: 'separator-ds-dn65.step', name: 'TJT8F65.step', size: '4 МБ', glb: '/uploads/3d/separator-ds-dn65.glb' }],   // спільна модель Dn65
  "TJT8F65": [{ file: 'separator-ds-dn65.step', name: 'TJT8F65.step', size: '4 МБ', glb: '/uploads/3d/separator-ds-dn65.glb' }],
  "TJT8F80": [{ file: 'separator-ds-dn80.step', name: 'TJT8F80.step', size: '3 МБ', glb: '/uploads/3d/separator-ds-dn80.glb' }],
  "TJT8F100": [{ file: 'separator-ds-dn100.step', name: 'TJT8F100.step', size: '3 МБ', glb: '/uploads/3d/separator-ds-dn100.glb' }],
}

// Регістр артикула в даних буває різний (84040TJ-W-02 / 84040tj-w-02) — шукаємо без урахування регістру
const BY_SKU_UPPER = Object.fromEntries(Object.entries(MODELS_BY_SKU).map(([k, v]) => [k.toUpperCase(), v]))

export function getModels3D(sku) {
  return (sku && BY_SKU_UPPER[String(sku).trim().toUpperCase()]) || []
}
