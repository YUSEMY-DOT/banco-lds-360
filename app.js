/****************************************************
 * BANCO LDS 360
 * IEP LA SALLE DEL SUR
 * Sistema financiero educativo
 ****************************************************/

const HOJAS = {
  ESTUDIANTES: 'ESTUDIANTES',
  CONFIG: 'CONFIG_OPCIONES',
  CAJA: 'CAJA',
  MOVIMIENTOS: 'MOVIMIENTOS',
  CUENTAS: 'CUENTAS'
};


/****************************************************
 * 1. BUSCAR ESTUDIANTE
 ****************************************************/

function obtenerEstudiante(codigo) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.ESTUDIANTES);

  if (!hoja) {
    throw new Error('No existe la hoja ESTUDIANTES');
  }

  const datos = hoja.getDataRange().getValues();

  if (datos.length < 2) {
    throw new Error('ESTUDIANTES no tiene registros');
  }

  const encabezados = datos[0].map(function(valor) {
    return normalizar(valor);
  });

  const columnaCodigo = encabezados.indexOf('CODIGO');

  if (columnaCodigo === -1) {
    throw new Error(
      'No encuentro la columna CODIGO en ESTUDIANTES. ' +
      'Encabezados encontrados: ' +
      encabezados.join(' | ')
    );
  }

  const codigoBuscado = String(codigo).trim().toUpperCase();

  for (let i = 1; i < datos.length; i++) {

    const codigoFila = String(datos[i][columnaCodigo])
      .trim()
      .toUpperCase();

    if (codigoFila === codigoBuscado) {

      const estudiante = {};

      encabezados.forEach(function(encabezado, indice) {
        estudiante[encabezado] = datos[i][indice];
      });

      return {
        encontrado: true,
        codigo: datos[i][columnaCodigo],
        nombre: estudiante.NOMBRE || '',
        apellido: estudiante.APELLIDO || '',
        nombreCompleto: estudiante.NOMBRE_COMPLETO || '',
        grado: estudiante.GRADO || '',
        seccion: estudiante.SECCION || '',
        docente: estudiante.DOCENTE || '',
        montoBase: numero(estudiante.MONTO_BASE),
        telefono: estudiante.TELEFONO || '',
        foto: estudiante.FOTO || '',
        fotoUrl: estudiante.FOTO_URL || ''
      };
    }
  }

  return {
    encontrado: false,
    mensaje: 'No se encontró el estudiante: ' + codigoBuscado
  };
}


/****************************************************
 * 2. PRUEBA DE DANY
 ****************************************************/

function pruebaDany() {

  const resultado = obtenerEstudiante('LDS-EST-001');

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );

  return resultado;
}


/****************************************************
 * 3. OBTENER CUENTA DEL ESTUDIANTE
 ****************************************************/

function obtenerCuenta(codigo) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(HOJAS.CUENTAS);

  if (!hoja) {
    throw new Error('No existe la hoja CUENTAS');
  }

  const datos = hoja.getDataRange().getValues();

  if (datos.length < 2) {

    return {
      encontrado: false,
      codigo: codigo,
      estudiante: '',
      grado: '',
      totalIngresos: 0,
      totalEgresos: 0,
      saldoActual: 0
    };

  }

  const encabezados = datos[0].map(function(valor) {
    return normalizar(valor);
  });

  const colCodigo = encabezados.indexOf('CODIGO');
  const colEstudiante = encabezados.indexOf('ESTUDIANTE');
  const colGrado = encabezados.indexOf('GRADO');
  const colIngresos = encabezados.indexOf('TOTAL INGRESOS');
  const colEgresos = encabezados.indexOf('TOTAL EGRESOS');
  const colSaldo = encabezados.indexOf('SALDO ACTUAL');

  if (colCodigo === -1) {
    throw new Error('No encuentro CODIGO en CUENTAS');
  }

  const codigoBuscado = String(codigo).trim().toUpperCase();

  for (let i = 1; i < datos.length; i++) {

    const codigoFila = String(datos[i][colCodigo])
      .trim()
      .toUpperCase();

    if (codigoFila === codigoBuscado) {

      return {
        encontrado: true,
        codigo: datos[i][colCodigo],
        estudiante: colEstudiante >= 0 ? datos[i][colEstudiante] : '',
        grado: colGrado >= 0 ? datos[i][colGrado] : '',
        totalIngresos: colIngresos >= 0 ? numero(datos[i][colIngresos]) : 0,
        totalEgresos: colEgresos >= 0 ? numero(datos[i][colEgresos]) : 0,
        saldoActual: colSaldo >= 0 ? numero(datos[i][colSaldo]) : 0
      };

    }

  }

  return {
    encontrado: false,
    codigo: codigoBuscado,
    estudiante: '',
    grado: '',
    totalIngresos: 0,
    totalEgresos: 0,
    saldoActual: 0
  };
}


/****************************************************
 * 4. CREAR CUENTA SI NO EXISTE
 ****************************************************/

function asegurarCuenta(codigo) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const estudiantes = ss.getSheetByName(HOJAS.ESTUDIANTES);
  const cuentas = ss.getSheetByName(HOJAS.CUENTAS);

  if (!estudiantes) {
    throw new Error('No existe ESTUDIANTES');
  }

  if (!cuentas) {
    throw new Error('No existe CUENTAS');
  }

  const estudiante = obtenerEstudiante(codigo);

  if (!estudiante.encontrado) {
    throw new Error('No existe el estudiante ' + codigo);
  }

  const datos = cuentas.getDataRange().getValues();

  const encabezados = datos.length
    ? datos[0].map(function(v) {
        return normalizar(v);
      })
    : [];

  const colCodigo = encabezados.indexOf('CODIGO');

  if (colCodigo === -1) {
    throw new Error('CUENTAS debe tener una columna CODIGO');
  }

  const codigoBuscado = String(codigo).trim().toUpperCase();

  for (let i = 1; i < datos.length; i++) {

    if (
      String(datos[i][colCodigo])
        .trim()
        .toUpperCase() === codigoBuscado
    ) {
      return i + 1;
    }

  }

  cuentas.appendRow([
    estudiante.codigo,
    estudiante.nombreCompleto ||
      (estudiante.nombre + ' ' + estudiante.apellido).trim(),
    estudiante.grado,
    0,
    0,
    0
  ]);

  return cuentas.getLastRow();
}


/****************************************************
 * 5. REGISTRAR MOVIMIENTO
 ****************************************************/

function registrarMovimiento(datosMovimiento) {

  const lock = LockService.getScriptLock();

  lock.waitLock(10000);

  try {

    const codigo = String(datosMovimiento.codigo || '').trim();

    const tipo = String(
      datosMovimiento.tipo || ''
    ).trim().toUpperCase();

    const concepto = String(
      datosMovimiento.concepto || ''
    ).trim();

    const monto = numero(datosMovimiento.monto);

    const responsable = String(
      datosMovimiento.responsable || ''
    ).trim();

    const observacion = String(
      datosMovimiento.observacion || ''
    ).trim();

    if (!codigo) {
      throw new Error('Falta el código del estudiante');
    }

    if (tipo !== 'INGRESO' && tipo !== 'EGRESO') {
      throw new Error(
        'El tipo debe ser INGRESO o EGRESO'
      );
    }

    if (!concepto) {
      throw new Error('Falta el concepto');
    }

    if (monto <= 0) {
      throw new Error('El monto debe ser mayor que 0');
    }

    const estudiante = obtenerEstudiante(codigo);

    if (!estudiante.encontrado) {
      throw new Error(
        'No existe el estudiante ' + codigo
      );
    }

    // Un EGRESO nunca puede superar el saldo disponible.
    if (tipo === 'EGRESO') {

      const cuentaActual = obtenerCuenta(codigo);
      const saldoDisponible = Number(
        cuentaActual.saldoActual || 0
      );

      if (monto > saldoDisponible) {
        throw new Error(
          'Saldo insuficiente. Saldo disponible: ' +
          saldoDisponible + ' LDS'
        );
      }
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const hojaMovimientos =
      ss.getSheetByName(HOJAS.MOVIMIENTOS);

    if (!hojaMovimientos) {
      throw new Error(
        'No existe la hoja MOVIMIENTOS'
      );
    }

    const filaMovimiento = [
      new Date(),
      estudiante.codigo,
      estudiante.nombreCompleto ||
        (estudiante.nombre + ' ' + estudiante.apellido).trim(),
      estudiante.grado,
      tipo,
      concepto,
      monto,
      responsable,
      observacion
    ];

    hojaMovimientos.appendRow(filaMovimiento);

    // Crear cuenta si todavía no existe
    asegurarCuenta(codigo);

    // Actualizar cuenta
    actualizarCuenta(codigo);

    // Obtener cuenta nueva
    const cuenta = obtenerCuenta(codigo);

    return {
      exito: true,
      mensaje: 'Movimiento registrado correctamente',
      movimiento: {
        codigo: estudiante.codigo,
        estudiante:
          estudiante.nombreCompleto ||
          (estudiante.nombre + ' ' + estudiante.apellido).trim(),
        tipo: tipo,
        concepto: concepto,
        monto: monto
      },
      cuenta: cuenta
    };

  } finally {

    lock.releaseLock();

  }
}


/****************************************************
 * 6. ACTUALIZAR CUENTA
 ****************************************************/

function actualizarCuenta(codigo) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const movimientos =
    ss.getSheetByName(HOJAS.MOVIMIENTOS);

  const cuentas =
    ss.getSheetByName(HOJAS.CUENTAS);

  if (!movimientos) {
    throw new Error('No existe MOVIMIENTOS');
  }

  if (!cuentas) {
    throw new Error('No existe CUENTAS');
  }

  asegurarCuenta(codigo);

  const datosMov = movimientos
    .getDataRange()
    .getValues();

  if (datosMov.length === 0) {
    return;
  }

  const encabezadosMov = datosMov[0]
    .map(function(valor) {
      return normalizar(valor);
    });

  const colCodigo =
    encabezadosMov.indexOf('CODIGO / QR') !== -1
      ? encabezadosMov.indexOf('CODIGO / QR')
      : encabezadosMov.indexOf('CODIGO');

  const colTipo =
    encabezadosMov.indexOf('TIPO DE MOVIMIENTO');

  const colMonto =
    encabezadosMov.indexOf('MONTO LDS');

  if (colCodigo === -1) {
    throw new Error(
      'No encuentro CODIGO / QR en MOVIMIENTOS'
    );
  }

  if (colTipo === -1) {
    throw new Error(
      'No encuentro TIPO DE MOVIMIENTO en MOVIMIENTOS'
    );
  }

  if (colMonto === -1) {
    throw new Error(
      'No encuentro MONTO LDS en MOVIMIENTOS'
    );
  }

  let totalIngresos = 0;
  let totalEgresos = 0;

  const codigoBuscado =
    String(codigo).trim().toUpperCase();

  for (let i = 1; i < datosMov.length; i++) {

    const codigoFila =
      String(datosMov[i][colCodigo])
        .trim()
        .toUpperCase();

    if (codigoFila !== codigoBuscado) {
      continue;
    }

    const tipo =
      String(datosMov[i][colTipo])
        .trim()
        .toUpperCase();

    const monto =
      numero(datosMov[i][colMonto]);

    if (tipo === 'INGRESO') {
      totalIngresos += monto;
    }

    if (tipo === 'EGRESO') {
      totalEgresos += monto;
    }

  }

  const cuenta =
    obtenerCuenta(codigo);

  const filaCuenta =
    buscarFilaCuenta(codigo);

  if (filaCuenta === -1) {
    throw new Error(
      'No se pudo encontrar la cuenta'
    );
  }

  // D = Total Ingresos
  // E = Total Egresos
  // F = Saldo Actual

  cuentas
    .getRange(filaCuenta, 4, 1, 3)
    .setValues([[
      totalIngresos,
      totalEgresos,
      totalIngresos - totalEgresos
    ]]);

}


/****************************************************
 * 7. BUSCAR FILA EN CUENTAS
 ****************************************************/

function buscarFilaCuenta(codigo) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const hoja =
    ss.getSheetByName(HOJAS.CUENTAS);

  const datos =
    hoja.getDataRange().getValues();

  if (datos.length < 2) {
    return -1;
  }

  const encabezados =
    datos[0].map(function(valor) {
      return normalizar(valor);
    });

  const colCodigo =
    encabezados.indexOf('CODIGO');

  if (colCodigo === -1) {
    throw new Error(
      'No encuentro CODIGO en CUENTAS'
    );
  }

  const codigoBuscado =
    String(codigo).trim().toUpperCase();

  for (let i = 1; i < datos.length; i++) {

    const valor =
      String(datos[i][colCodigo])
        .trim()
        .toUpperCase();

    if (valor === codigoBuscado) {
      return i + 1;
    }

  }

  return -1;
}


/****************************************************
 * 8. CONSULTAR TODO: ESTUDIANTE + CUENTA
 ****************************************************/

function consultarEstudiante(codigo) {

  const estudiante =
    obtenerEstudiante(codigo);

  if (!estudiante.encontrado) {
    return estudiante;
  }

  asegurarCuenta(codigo);

  const cuenta =
    obtenerCuenta(codigo);

  const movimientos =
    obtenerMovimientos(codigo);

  return {
    encontrado: true,
    estudiante: estudiante,
    cuenta: cuenta,
    movimientos: movimientos
  };
}


/****************************************************
 * 9. OBTENER MOVIMIENTOS DEL ESTUDIANTE
 ****************************************************/

function obtenerMovimientos(codigo) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const hoja =
    ss.getSheetByName(HOJAS.MOVIMIENTOS);

  if (!hoja) {
    throw new Error(
      'No existe MOVIMIENTOS'
    );
  }

  const datos =
    hoja.getDataRange().getValues();

  if (datos.length < 2) {
    return [];
  }

  const encabezados =
    datos[0].map(function(valor) {
      return normalizar(valor);
    });

  const colFecha =
    encabezados.indexOf('ID O MARCA TEMPORAL') !== -1
      ? encabezados.indexOf('ID O MARCA TEMPORAL')
      : 0;

  const colCodigo =
    encabezados.indexOf('CODIGO / QR') !== -1
      ? encabezados.indexOf('CODIGO / QR')
      : encabezados.indexOf('CODIGO');

  const colEstudiante =
    encabezados.indexOf('ESTUDIANTE');

  const colGrado =
    encabezados.indexOf('GRADO');

  const colTipo =
    encabezados.indexOf('TIPO DE MOVIMIENTO');

  const colConcepto =
    encabezados.indexOf('CONCEPTO');

  const colMonto =
    encabezados.indexOf('MONTO LDS');

  const colResponsable =
    encabezados.indexOf('RESPONSABLE');

  const colObservacion =
    encabezados.indexOf('OBSERVACION');

  const codigoBuscado =
    String(codigo).trim().toUpperCase();

  const resultado = [];

  for (let i = datos.length - 1; i >= 1; i--) {

    const codigoFila =
      String(datos[i][colCodigo])
        .trim()
        .toUpperCase();

    if (codigoFila !== codigoBuscado) {
      continue;
    }

    resultado.push({

      fecha:
        colFecha >= 0
          ? datos[i][colFecha]
          : '',

      codigo:
        datos[i][colCodigo],

      estudiante:
        colEstudiante >= 0
          ? datos[i][colEstudiante]
          : '',

      grado:
        colGrado >= 0
          ? datos[i][colGrado]
          : '',

      tipo:
        colTipo >= 0
          ? datos[i][colTipo]
          : '',

      concepto:
        colConcepto >= 0
          ? datos[i][colConcepto]
          : '',

      monto:
        colMonto >= 0
          ? numero(datos[i][colMonto])
          : 0,

      responsable:
        colResponsable >= 0
          ? datos[i][colResponsable]
          : '',

      observacion:
        colObservacion >= 0
          ? datos[i][colObservacion]
          : ''

    });

  }

  return resultado;
}


/****************************************************
 * 10. FUNCIÓN PARA PROBAR LA CUENTA
 ****************************************************/

function pruebaCuentaDany() {

  const resultado =
    consultarEstudiante('LDS-EST-001');

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );

  return resultado;
}


/****************************************************
 * 11. WEB APP
 ****************************************************/

function doGet(e) {

  try {

    const parametros =
      (e && e.parameter)
        ? e.parameter
        : {};

    const accion =
      String(
        parametros.accion ||
        parametros.action ||
        ''
      )
      .trim()
      .toLowerCase();


    // ==================================================
    // REGISTRAR MOVIMIENTO
    // ==================================================

    if (
      accion === 'registrarmovimiento' ||
      accion === 'movimiento'
    ) {

      const datosMovimiento = {
        codigo: parametros.codigo || '',
        tipo: parametros.tipo || '',
        concepto: parametros.concepto || '',
        monto: parametros.monto || '',
        responsable: parametros.responsable || 'BANCO LDS 360',
        observacion: parametros.observacion || ''
      };

      const resultado =
        registrarMovimiento(datosMovimiento);

      return ContentService
        .createTextOutput(
          JSON.stringify({
            ok: true,
            exito: resultado.exito === true,
            mensaje: resultado.mensaje || 'Movimiento registrado correctamente.',
            movimiento: resultado.movimiento || null,
            cuenta: resultado.cuenta || null
          })
        )
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ==================================================
    // CONSULTAR ESTUDIANTE
    // ==================================================

    const codigo =
      parametros.codigo || '';

    if (codigo) {

      const resultado =
        consultarEstudiante(codigo);

      return ContentService
        .createTextOutput(
          JSON.stringify({
            ok: true,
            ...resultado
          })
        )
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ==================================================
    // COMPROBAR CONEXIÓN
    // ==================================================

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: true,
          sistema: 'Banco LDS 360',
          institucion: 'IEP La Salle del Sur',
          estado: 'conectado'
        })
      )
      .setMimeType(ContentService.MimeType.JSON);


  } catch (error) {

    console.error('ERROR WEB APP:', error);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: false,
          exito: false,
          mensaje:
            error && error.message
              ? error.message
              : String(error)
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/****************************************************
 * 12. NORMALIZAR TEXTOS
 ****************************************************/

function normalizar(valor) {

  return String(valor || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

}


/****************************************************
 * 13. CONVERTIR A NÚMERO
 ****************************************************/

function numero(valor) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return 0;
  }

  if (typeof valor === 'number') {
    return isNaN(valor) ? 0 : valor;
  }

  let texto =
    String(valor)
      .replace('S/', '')
      .replace(/\s/g, '')
      .trim();

  // Si viene como 1.130,50
  if (
    texto.includes('.') &&
    texto.includes(',')
  ) {

    texto =
      texto
        .replace(/\./g, '')
        .replace(',', '.');

  } else if (texto.includes(',')) {

    texto =
      texto.replace(',', '.');

  }

  const resultado =
    Number(texto);

  return isNaN(resultado)
    ? 0
    : resultado;

}
// ============================================================
// BANCO LDS 360 - REGISTRO DE MOVIMIENTOS
// ============================================================

// ============================================================
// CONVERTIR MONTO A NÚMERO
// ============================================================

function convertirMontoLDS(valor) {

  if (typeof valor === 'number') {
    return valor;
  }

  let texto = String(valor || '')
    .replace('S/', '')
    .replace('LDS', '')
    .replace(/\s/g, '')
    .trim();

  if (texto.includes(',') && texto.includes('.')) {

    if (texto.lastIndexOf(',') > texto.lastIndexOf('.')) {
      texto = texto.replace(/\./g, '');
      texto = texto.replace(',', '.');
    } else {
      texto = texto.replace(/,/g, '');
    }

  } else if (texto.includes(',')) {

    texto = texto.replace(',', '.');
  }

  const numero = Number(texto);

  return isNaN(numero) ? 0 : numero;
}


// ============================================================
// ACTUALIZAR CUENTA DEL ESTUDIANTE
// ============================================================

function actualizarCuentaLDS(codigo) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const hojaMovimientos = ss.getSheetByName('MOVIMIENTOS');
  const hojaCuentas = ss.getSheetByName('CUENTAS');

  if (!hojaMovimientos) {
    throw new Error('No existe la hoja MOVIMIENTOS.');
  }

  if (!hojaCuentas) {
    throw new Error('No existe la hoja CUENTAS.');
  }

  const movimientos = hojaMovimientos.getDataRange().getValues();

  let totalIngresos = 0;
  let totalEgresos = 0;

  let estudiante = '';
  let grado = '';

  for (let i = 1; i < movimientos.length; i++) {

    const fila = movimientos[i];

    const codigoMovimiento = String(fila[1]).trim();

    if (codigoMovimiento !== String(codigo).trim()) {
      continue;
    }

    estudiante = fila[2] || estudiante;
    grado = fila[3] || grado;

    const tipo = String(fila[4]).trim().toUpperCase();
    const monto = convertirMontoLDS(fila[6]);

    if (tipo === 'INGRESO') {
      totalIngresos += monto;
    }

    if (tipo === 'EGRESO') {
      totalEgresos += monto;
    }
  }

  const saldoActual = totalIngresos - totalEgresos;

  const cuentas = hojaCuentas.getDataRange().getValues();

  let filaCuenta = -1;

  for (let i = 1; i < cuentas.length; i++) {

    if (String(cuentas[i][0]).trim() === String(codigo).trim()) {
      filaCuenta = i + 1;
      break;
    }
  }

  // ----------------------------------------------------------
  // SI NO EXISTE LA CUENTA, CREARLA
  // ----------------------------------------------------------

  if (filaCuenta === -1) {

    hojaCuentas.appendRow([
      codigo,
      estudiante,
      grado,
      totalIngresos,
      totalEgresos,
      saldoActual
    ]);

  } else {

    hojaCuentas.getRange(filaCuenta, 2, 1, 5).setValues([[
      estudiante,
      grado,
      totalIngresos,
      totalEgresos,
      saldoActual
    ]]);
  }

  return {
    codigo: codigo,
    estudiante: estudiante,
    grado: grado,
    totalIngresos: totalIngresos,
    totalEgresos: totalEgresos,
    saldoActual: saldoActual
  };
}
