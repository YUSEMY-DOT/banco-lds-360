// Datos iniciales tomados del Excel Banco LDS 360.
const STUDENTS = [
['LDS-EST-001','DANY SMITH','FRANCISCO CRIOLLO','TERCERO','LOS DIVERGENTES','DANY.JPG',1130],
['LDS-EST-002','ITALO JOSIMAR','MATEO RIVAS','QUINTO','LOS TECNOLOGICOS','JOSIMAR.JPG',1130],
['LDS-EST-003','JERIEL EMANUEL','MATEO RIVAS','PRIMERO','LOS OBSERVADORES','JERIEL.JPG',1130],
['LDS-EST-004','ADAM STUARD','PINEDA ELGUERA','QUINTO','LOS TECNOLOGICOS','ADAM.jpeg',1130],
['LDS-EST-005','CAMILA','PIZARRO MENDOZA','SEGUNDO','LOS AMABLES','CAMILA.jpeg',1130],
['LDS-EST-006','ANA PAULA','QUISPE FLORES','QUINTO','LOS TECNOLOGICOS','ANA.jpeg',1130],
['LDS-EST-007','MARCOS MANUEL','ROMERO SIESQUEN','PRIMERO','LOS OBSERVADORES','MARCOS.jpeg',1130],
...Array.from({length:23},(_,i)=>[`LDS-EST-${String(i+8).padStart(3,'0')}`,'','','','','',1130])
].map(s=>({codigo:s[0],nombres:s[1],apellidos:s[2],grado:s[3],seccion:s[4],foto:s[5],sueldo:s[6],ingresos:0,bonificaciones:0,egresos:0,ahorro:0,consecuencias:0,saldo:s[6]}));
const CONFIG={PIN_ADMIN:'360LDS',NOMBRE_SISTEMA:'Banco LDS 360',MONEDA:'Nuevo Sol Lasallista (LDS)',SUELDO_BASE:1130};
