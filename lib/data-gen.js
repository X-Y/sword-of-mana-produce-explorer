const fs = require('fs');

const splitInTwos = (input) => {
  const splits = [];
  for(let i = 0; i<input.length; i+=2) {
    const pair = input.slice(i, i + 2);
    splits.push(pair)
  }
  return splits;
}

const data = fs.readFileSync('./source.txt', 'utf8')

const cleanedDayMix = 
  data.replace(/^ {0,2}[¯_]+[\/\\]{0,1}\n?/gm, '')
  .replace(/\||\\/g, '')
  .split(/ +(.+Day)/)
  .splice(1)
  
const daySplits = splitInTwos(cleanedDayMix);

const endData = daySplits.reduce((prevDayData, [dayTitle, dayContent]) => {
  const cleanedSeedMix = dayContent
    .replaceAll(/^ *\r\n/gm, '')
    .split(/^ (.+Seed) \r\n/gm)
    .filter(Boolean)
  const seedSplits = splitInTwos(cleanedSeedMix);
  
  const seedData = seedSplits.reduce((prevSeed, [seedTitle, seedContent]) => {
    const seed2NresultMatches = [...seedContent.matchAll(/ \+ (.+Seed) += (.+)/g)];
    const seed2Nresult = seed2NresultMatches.reduce((prev,curr) => {
      const [, seed2, result] = curr;
      return [
        ...prev,
        [seed2, result.trimEnd()]
      ]
    }, [])
    return [
      ...prevSeed,
      ...seed2Nresult.map(one => [seedTitle, ...one])
    ]
  }, [])
 
  return [
    ...prevDayData,
    ...seedData.map(one => [dayTitle, ...one])
  ]
}, [])

/*const produces = Array.from(
  new Set(endData.map(([,,,one]) => one))
)

console.log(produces.sort())
*/

fs.writeFileSync('./output.json', JSON.stringify(endData));
