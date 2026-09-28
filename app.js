function doGet(e) {
  var params = e.parameter;
  var callback = params.callback;
  var accion = params.accion ? params.accion.toString().trim().toUpperCase() : "";
  var result = {};

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById("1j0A6XtLbCXJLkVTBXRpK-GnV3QY4qYQ_SOReARpu9ag");
    }

    if (accion === "CONSULTAR" || accion === "ESTUDIANTE") {
      result = obtenerEstudianteOUsuario(ss, params.codigo);
    } else if (accion === "LOGINALUMNO") {
      result = validarLogin(ss, params.codigo, params.clave);
    } else if (accion === "REGISTRAR_TRANSACCION" || accion === "REGISTRARMOVIMIENTO") {
      result = registrarMovimiento(ss, params);
    } else {
      result = { ok: false, success: false, mensaje: "Acción no reconocida: " + accion };
    }
  } catch (err) {
    result = { ok: false, success: false, mensaje: "Error en el servidor: " + err.toString() };
  }

  var jsonOutput = JSON.stringify(result);
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + jsonOutput + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(jsonOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function validarLogin(ss, codigo, clave) {
  if (!codigo) return { ok: false, success: false, mensaje: "Código no proporcionado" };
  codigo = codigo.toString().trim().toUpperCase();
  
  var sheetEst = ss.getSheetByName("ESTUDIANTES");
  var dataEst = sheetEst.getDataRange().getValues();
  var encontrado = false;

  for (var i = 1; i < dataEst.length; i++) {
    var row = dataEst[i];
    if (row[0] && row[0].toString().trim().toUpperCase() === codigo) {
      encontrado = true;
      break;
    }
  }

  if (encontrado) {
    return { ok: true, success: true, mensaje: "Acceso correcto" };
  } else {
    return { ok: false, success: false, mensaje: "Código no encontrado" };
  }
}

function obtenerEstudianteOUsuario(ss, codigo) {
  if (!codigo) return { ok: false, success: false, mensaje: "Código no proporcionado" };
  codigo = codigo.toString().trim().toUpperCase();

  var sheetEst = ss.getSheetByName("ESTUDIANTES");
  var dataEst = sheetEst.getDataRange().getValues();
  var usuario = null;
  var esDocente = false;

  if (codigo.indexOf("LDS-DOC") !== -1) {
    esDocente = true;
  }

  for (var i = 1; i < dataEst.length; i++) {
    var row = dataEst[i];
    if (row[0] && row[0].toString().trim().toUpperCase() === codigo) {
      var rolUpper = (row[3] || "").toString().toUpperCase();
      if (codigo.indexOf("LDS-DOC") !== -1 || rolUpper.indexOf("DOCENTE") !== -1 || rolUpper.indexOf("PROMOTORA") !== -1 || rolUpper.indexOf("COORDINADORA") !== -1) {
        esDocente = true;
      }
      usuario = {
        codigo: row[0].toString().trim(),
        nombre: row[1] || "",
        apellido: row[2] || "",
        rol: row[3] || (esDocente ? "DOCENTE" : "ALUMNO"),
        grado: row[4] || "",
        seccion: row[5] || "",
        telefono: row[6] || "",
        nombreCompleto: row[7] || (row[1] + " " + row[2]),
        foto: row[8] || "",
        fotoUrl: row[9] || row[8] || "",
        esDocente: esDocente
      };
      break;
    }
  }

  if (!usuario) {
    return { ok: false, success: false, mensaje: "Código no encontrado: " + codigo };
  }

  var sheetMov = ss.getSheetByName("MOVIMIENTOS");
  var dataMov = sheetMov.getDataRange().getValues();
  var movimientos = [];

  var totalIngresosAlumno = 0;
  var totalEgresosAlumno = 0;
  var totalEntregadoMaestra = 0;
  var totalCobradoMaestra = 0;

  var nombreDocenteUpper = usuario.nombreCompleto.toUpperCase();
  var nombreSimpleUpper = usuario.nombre.toUpperCase();

  for (var j = 1; j < dataMov.length; j++) {
    var r = dataMov[j];
    var codEstudiante = r[1] ? r[1].toString().trim().toUpperCase() : "";
    var responsable = r[7] ? r[7].toString().trim().toUpperCase() : "";
    var tipo = r[4] ? r[4].toString().trim().toUpperCase() : "";
    var monto = parseFloat(r[6]) || 0;

    if (!esDocente && codEstudiante === codigo) {
      if (tipo.indexOf("INGRESO") !== -1) {
        totalIngresosAlumno += monto;
      } else if (tipo.indexOf("EGRESO") !== -1) {
        totalEgresosAlumno += monto;
      }

      movimientos.push({
        fechaTexto: r[0] ? r[0].toString() : "",
        codigo: r[1] ? r[1].toString() : "",
        estudiante: r[2] ? r[2].toString() : "",
        grado: r[3] ? r[3].toString() : "",
        tipo: r[4] ? r[4].toString() : "",
        concepto: r[5] ? r[5].toString() : "",
        monto: monto,
        responsable: r[7] ? r[7].toString() : "",
        observacion: r[8] ? r[8].toString() : ""
      });
    }

    var esMovimientoDeEstaMaestra = esDocente && (
      codEstudiante === codigo ||
      responsable.indexOf(codigo) !== -1 ||
      (nombreDocenteUpper && responsable.indexOf(nombreDocenteUpper) !== -1) ||
      (nombreSimpleUpper && responsable.indexOf(nombreSimpleUpper) !== -1)
    );

    if (esMovimientoDeEstaMaestra) {
      if (tipo.indexOf("INGRESO") !== -1) {
        totalEntregadoMaestra += monto;
      } else if (tipo.indexOf("EGRESO") !== -1) {
        totalCobradoMaestra += monto;
      }

      movimientos.push({
        fechaTexto: r[0] ? r[0].toString() : "",
        codigo: r[1] ? r[1].toString() : "",
        estudiante: r[2] ? r[2].toString() : "",
        grado: r[3] ? r[3].toString() : "",
        tipo: r[4] ? r[4].toString() : "",
        concepto: r[5] ? r[5].toString() : "",
        monto: monto,
        responsable: r[7] ? r[7].toString() : "",
        observacion: r[8] ? r[8].toString() : ""
      });
    }
  }

  var saldoActual = 0;
  if (esDocente) {
    var fondoBaseMaestra = 100000;
    saldoActual = fondoBaseMaestra - totalEntregadoMaestra + totalCobradoMaestra;
  } else {
    saldoActual = totalIngresosAlumno - totalEgresosAlumno;
  }

  return {
    ok: true,
    success: true,
    estudiante: usuario,
    cuenta: {
      totalIngresos: totalIngresosAlumno,
      totalEgresos: totalEgresosAlumno,
      totalEntregadoMaestra: totalEntregadoMaestra,
      totalCobradoMaestra: totalCobradoMaestra,
      saldoActual: saldoActual
    },
    movimientos: movimientos
  };
}

function registrarMovimiento(ss, params) {
  var codigo = params.codigo ? params.codigo.toString().trim().toUpperCase() : "";
  var tipo = params.tipo ? params.tipo.toString().trim().toUpperCase() : "INGRESO";
  var concepto = params.concepto || "";
  var monto = parseFloat(params.monto) || 0;
  var responsable = params.responsable || "DOCENTE";
  var observacion = params.observacion || "";

  if (!codigo) return { ok: false, success: false, mensaje: "Código requerido" };
  if (monto <= 0) return { ok: false, success: false, mensaje: "Monto inválido" };

  var sheetEst = ss.getSheetByName("ESTUDIANTES");
  var dataEst = sheetEst.getDataRange().getValues();
  var nombreCompleto = "";
  var grado = "";

  for (var i = 1; i < dataEst.length; i++) {
    var row = dataEst[i];
    if (row[0] && row[0].toString().trim().toUpperCase() === codigo) {
      nombreCompleto = row[7] || (row[1] + " " + row[2]);
      grado = row[4] || "";
      break;
    }
  }

  var sheetMov = ss.getSheetByName("MOVIMIENTOS");
  var timestamp = Utilities.formatDate(new Date(), "America/Lima", "dd/MM/yyyy HH:mm:ss");

  sheetMov.appendRow([
    timestamp,
    codigo,
    nombreCompleto,
    grado,
    tipo,
    concepto,
    monto,
    responsable,
    observacion
  ]);

  return { ok: true, success: true, mensaje: "Transacción registrada exitosamente" };
}
