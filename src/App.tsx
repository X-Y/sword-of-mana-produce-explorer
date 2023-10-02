import {useMemo, useState, useEffect} from 'react';

import data from '../lib/output.json';

const getUniqueAspects = (data) => {
   return data.reduce((prev, [day, seed1, seed2, result]) => {
      const [daySet, seed1Set, seed2Set, resultSet] = prev;
      daySet.add(day);
      seed1Set.add(seed1);
      seed2Set.add(seed2);
      resultSet.add(result);
      return prev;
    }, [new Set(), new Set(), new Set(), new Set()])
    .map(one => Array.from(one));
}
const useData = (daysFilter, seed1Filter, resultFilter) => {
  const allAspects = useMemo(() => {
    return getUniqueAspects(data);
  }, data)
  const newData = data.filter(([day, seed1, seed2, result]) => {
    const res =  
      (daysFilter.length ? daysFilter.includes(day) : true) &&
      (seed1Filter.length ? seed1Filter.includes(seed1): true) &&
      (resultFilter.length ? resultFilter.includes(result) : true)
    return res;
  });
  
  const availabilities = useMemo(() => {
    const checkList = allAspects.map(aspectList => {
      const aspectListMap = aspectList.map(one => [one, false]);
      return Object.fromEntries(aspectListMap);
    })
    return newData.reduce((prev, [day, seed1, seed2, result]) => {
      const [dayCheckList, seed1CheckList, seed2CheckList, resultCheckList] = prev;
      dayCheckList[day] = true;
      seed1CheckList[seed1] = true;
      seed2CheckList[seed2] = true;
      resultCheckList[result] = true;
      return prev;
    }, checkList)
    
  }, [newData]);
  return [newData, ...availabilities];
}

const OptionsList = ({data, prefix, onUpdate}) => {
  const [choosen, setChoosen] = useState([]);
  
  const onChange = (e) => {
    setChoosen(oldChoosen => {
      const resSet = new Set(oldChoosen);
      resSet[e.target.checked? 'add' : 'delete'](e.target.value);
      return Array.from(resSet);
    })
  }
  
  useEffect(() => {
    onUpdate(choosen)
  }, [choosen]);
  
  return <div>
    <h3>{prefix}</h3>
    {Object.entries(data).map(([one, available]) => {
      const id=`${prefix}-${one.replace(/\s+/g, '_')}`;
      const disabled = available ? undefined: true;
      return <span key={id}>
        <input type='checkbox' id={id} value={one} disabled={disabled} onChange={onChange}/>
        <label for={id}>{one}</label>
      </span>
    })}
  </div>
  
}
function App() {
  const [daysFilter, setDaysFilter] = useState([]);
  const [seed1Filter, setSeed1Filter] = useState([]);
  const [resultFilter, setResultFilter] = useState([]);
  
  const data = useData(daysFilter, seed1Filter, resultFilter);
  const [filteredData, availableDays, availableSeed1, availableSeed2, availableResult] = data;
  
  const formattedData = useMemo(() => {  
    return filteredData.reduce((prev, [day, seed1, seed2, result]) => {
      if(!prev[day]) prev[day] = {};
      if(!prev[day][seed1]) prev[day][seed1] = [];
      prev[day][seed1].push([seed2, result]);
      return prev;
    }, {})
  }, [filteredData]);  
  
  return (
    <>
      <h1>Sword of Mana Produce Explorer</h1>
      <h2>Filters</h2>
      <OptionsList data={availableDays} prefix='days' onUpdate={setDaysFilter}/>
      <OptionsList data={availableSeed1} prefix='seed1' onUpdate={setSeed1Filter} />
      <OptionsList data={availableResult} prefix='result' onUpdate={setResultFilter} />
      <h2>Availables</h2>
      <div>
      {
        Object.entries(formattedData).map(([day, dayData]) => {
          return <div>
          <h3>{day}</h3>
            {Object.entries(dayData).map(([seed1, formularData]) => {
              return <div>
                <h4>{seed1}</h4>
                  {formularData.map(([seed2, result])=> {
                    return <div>
                      + {seed2} = {result}
                    </div>
                    
                  })}
              </div>
            })}
          </div>
          
        })
        
      }
      </div>
    </>
  )
}

export default App
