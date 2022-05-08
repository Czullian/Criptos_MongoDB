//numero de criptomonedas a evaluar
db.Tarea.aggregate([{
    $group: {
        _id: {criptos:"$criptos"},
        cantidad_criptos: {
            $sum: 1
        }
    }
}])

//Primera cripto del top
db.Tarea.aggregate([{
    $project: {
        _id: 0,
        name: 1,
        rank: 1
    }
}, {
    $sort: {
        rank:1
    }
}, {
    $limit: 1
}])

//Ultima cripto del top
db.Tarea.aggregate([{
    $project: {
        _id: 0,
        name: 1,
        rank: 1
    }
}, {
    $sort: {
        rank: -1
    }
}, {
    $limit: 1
}])
//Update de nombre
db.Tarea.update({ _id: ObjectId("626984ae37445f4721bee66d") }, {
    $set: {
        "name": "SysCoin",
    }
})

//Cantidad de billeteras por Token
db.Tarea.aggregate(
[{$project: {
 _id: 0,
 name: 1,
 Wallet_amount: 1
}}, {$sort: {
 Wallet_amount: -1
}}, {$limit: 10}, {$group: {
 _id: '$Wallet_amount',
 criptos: {
  $push: {
   name: '$name'
  }
 }
}}, {$replaceWith: {
 $mergeObjects: {
  Cantidad_billeteras: '$_id',
  nombre: '$criptos.name'
 }
}}, {$sort: {
 Cantidad_billeteras: -1
}}])

//Consenso  de prueba 
db.Tarea.aggregate(
[{$project: {
 _id: 0,
 name: 1,
 'Proof System': 1
}}, {$group: {
 _id: {
  Sistema_prueba: '$Proof System'
 },
 Cantidad: {
  $sum: 1
 }
}}, {$sort: {
 Cantidad: -1
}}])

//Capitalizacion Relativo a Bitcoin

db.Tarea.aggregate([{$project: {
 _id: 0,
 name: 1,
 market_cap: 1
}}, {$group: {
 _id: 'null',
 maximo_cap: {
  $max: '$market_cap'
 },
 items: {
  $push: {
   name: '$name',
   market_cap: '$market_cap'
  }
 }
}}, {$unwind: {
 path: '$items'
}}, {$addFields: {
 Capitalizacion_relativa: {
  $multiply: [
   {
    $divide: [
     '$items.market_cap',
     '$maximo_cap'
    ]
   },
   100
  ]
 }
}}, {$match: {
 Capitalizacion_relativa: {
  $gt: 0,
  $lt: 100
 }
}}, {$project: {
 'items.name': 1,
 '%Capitalizacion_Relativa': {
  $round: [
   '$Capitalizacion_relativa',
   1
  ]
 }
}}, {$sort: {
 '%Capitalizacion_Relativa': -1
}}, {$limit: 10}, {$replaceWith: {
 $mergeObjects: {
  name: '$items.name',
  Cap_relativa: '$%Capitalizacion_Relativa'
 }
}}])
//Lider staking
db.Tarea.aggregate([
    {$project: {"name":1,"Staked_value":1}},
    {$addFields: {
 Staked_value: {
  $toDecimal: '$Staked_value'
 }
    {$sort: {"Staked_value":-1}},
    {$limit: 1}
    ])
//Staking Relativo Solana
db.Tarea.aggregate([{$project: {
 _id: 0,
 name: 1,
 Staked_value: 1
}}, {$addFields: {
 Staked_value: {
  $toDecimal: '$Staked_value'
 }
}}, {$group: {
 _id: 'null',
 maximo: {
  $max: '$Staked_value'
 },
 items: {
  $push: {
   stake: '$Staked_value',
   name: '$name'
  }
 }
}}, {$unwind: {
 path: '$items'
}}, {$replaceWith: {
 $mergeObjects: {
  id: '$_id',
  nombre: '$items.name',
  stake: '$items.stake',
  maximo: '$maximo'
 }
}}, {$addFields: {
 Staking_relativo: {
  $multiply: [
   {
    $divide: [
     '$stake',
     '$maximo'
    ]
   },
   100
  ]
 }
}}, {$project: {
 _id: 0,
 nombre: 1,
 '%Staking_relativo': {
  $round: [
   '$Staking_relativo',
   1
  ]
 }
}}, {$match: {
 '%Staking_relativo': {
  $lt: 100
 }
}}, {$sort: {
 '%Staking_relativo': -1
}}, {$limit: 10}])

//Participación por Cripto
db.Tarea.aggregate([{
    $project: {
        _id: 0,
        name: 1,
        Participation: 1
    }
}, {
    $sort: {
        Participation: -1
    }
}, {
    $limit: 10
}])



//Criptos mas antiguas
db.Tarea.aggregate([{$project: {
 name: 1,
 Fecha_larga: {
  $split: [
   '$date_added',
   ' '
  ]
 },
 rank: 1
}}, {$project: {
 _id: 0,
 name: 1,
 rank: 1,
 Fecha: {
  $arrayElemAt: [
   '$Fecha_larga',
   0
  ]
 }
}}, {$project: {
 name: 1,
 Fecha_larga: {
  $split: [
   '$Fecha',
   '/'
  ]
 },
 rank: 1
}}, {$addFields: {
 Year: {
  $toInt: {
   $arrayElemAt: [
    '$Fecha_larga',
    2
   ]
  }
 },
 Month: {
  $toInt: {
   $arrayElemAt: [
    '$Fecha_larga',
    1
   ]
  }
 },
 Day: {
  $toInt: {
   $arrayElemAt: [
    '$Fecha_larga',
    0
   ]
  }
 }
}}, {$project: {
 name: 1,
 Year: 1,
 Month: 1,
 Day: 1,
 rank: 1
}}, {$sort: {
 Year: 1,
 Month: 1,
 Day: 1
}}, {$limit: 20}])
 
//Restante para Dilusion Total
db.Tarea.aggregate(
[{$project: {
 _id: 0,
 name: 1,
 diference_supply: {
  $subtract: [
   '$max_supply',
   '$circulating_supply'
  ]
 },
 max_supply: 1,
 circulating_supply: 1
}}, {$addFields: {
 Total_Dilusion: {
  $multiply: [
   {
    $divide: [
     '$diference_supply',
     '$max_supply'
    ]
   },
   100
  ]
 }
}}, {$match: {
 Total_Dilusion: {
  $gt: 0
 }
}}, {$sort: {
 Total_Dilusion: 1
}}, {$limit: 10}])

//Mejor Promedio 

db.Tarea.aggregate([{$project: {
 _id: 0,
 name: 1,
 rank: 1,
 'Market Opportunity': 1,
 'Underlying Technology': 1,
 'Ecosystem Structure': 1,
 'Core Team': 1,
 'Token Economics': 1,
 'Roadmap Progress': 1
}}, {$addFields: {
 Mejor_promedio: {
  $divide: [
   {
    $add: [
     '$Market Opportunity',
     '$Underlying Technology',
     '$Ecosystem Structure',
     '$Core Team',
     '$Token Economics',
     '$Roadmap Progress'
    ]
   },
   7
  ]
 }
}}, {$project: {
 name: 1,
 rank: 1,
 Mejor_promedio: {
  $round: [
   '$Mejor_promedio',
   2
  ]
 }
}}, {$sort: {
 Mejor_promedio: -1
}}, {$limit: 10}])


//Posibles Joyas

db.Tarea.aggregate([{$project: {
 _id: 0,
 name: 1,
 Grade: 1,
 rank: 1
}}, {$match: {
 Grade: {
  $in: [
   'A',
   'A-',
   'A',
   'B+',
   'B-',
   'B'
  ]
 },
 rank: {
  $gte: 80
 }
}}, {$group: {
 _id: '$Grade',
 CriptoRank: {
  $push: {
   name: '$name'
  }
 },
 cantidad_grado: {
  $sum: 1
 }
}}, {$replaceWith: {
 $mergeObjects: {
  grade: '$_id',
  nombre: '$CriptoRank.name',
  cantidad: '$cantidad_grado'
 }
}}])
    
//No recomendadas

db.Tarea.aggregate([{$project: {
 _id: 0,
 name: 1,
 Grade: 1,
 rank: 1
}}, {$match: {
 Grade: {
  $in: [
   'C-',
   'D'
  ]
 },
 rank: {
  $lte: 40
 }
}}, {$group: {
 _id: '$Grade',
 CriptoRank: {
  $push: {
   name: '$name'
  }
 },
 cantidad_grado: {
  $sum: 1
 }
}}, {$replaceWith: {
 $mergeObjects: {
  grade: '$_id',
  nombre: '$CriptoRank.name',
  cantidad: '$cantidad_grado'
 }
}}])




