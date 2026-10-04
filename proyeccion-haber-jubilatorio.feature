# language: es
# Fuente: PRD-001-proyeccion-haber-jubilatorio.md, sección 5 (Criterios de Aceptación).
# Cada escenario o bloque de ejemplos lleva la etiqueta del AC y del RF/RNF que verifica.
# Las fechas de los ejemplos son relativas a "hoy" para que las pruebas no venzan.

@PRD-001
Característica: Proyección de haber jubilatorio
  Como usuario de CPBA
  quiero generar la proyección de mi haber básico jubilatorio
  para estimar cuál será mi haber el día que me jubile

  Antecedentes:
    Dado que el afiliado tiene sesión iniciada en el sitio actual

  # ---------------------------------------------------------------
  # Inicio y fechas mínimas (RF-01, RF-02, RF-11)
  # ---------------------------------------------------------------

  @AC-01 @RF-01
  Escenario: Se muestran las fechas mínimas que devuelve el backend
    Cuando ingresa al módulo de proyección
    Entonces la pantalla muestra las fechas mínimas de Jubilación Ordinaria y Jubilación Parcial que devuelve el servicio backend actual para ese afiliado

  @RF-11 @RF-02
  Esquema del escenario: Afiliado con los dos beneficios alcanzados no puede proyectar
    Dado que la fecha mínima de Jubilación Parcial es <fecha parcial>
    Y que la fecha mínima de Jubilación Ordinaria es <fecha ordinaria>
    Cuando ingresa al módulo de proyección
    Entonces se muestra la alerta "Ud. se encuentra en condiciones de jubilarse"
    Y el botón "Proyectar" está deshabilitado
    Y se muestra el botón "Inicie su trámite de jubilación aquí"

    @AC-02
    Ejemplos: Fechas iguales a hoy (caso límite)
      | fecha parcial | fecha ordinaria |
      | hoy           | hoy             |

    @AC-03
    Ejemplos: Fechas anteriores a hoy
      | fecha parcial | fecha ordinaria |
      | hoy - 1 año   | hoy - 1 día     |

  @AC-04 @RF-02 @RF-11
  Escenario: Afiliado con un solo beneficio alcanzado puede proyectar y ve el botón de trámite
    Dado que la fecha mínima de Jubilación Parcial es hoy
    Y que la fecha mínima de Jubilación Ordinaria es mañana
    Cuando ingresa al módulo de proyección
    Entonces se muestra el botón "Inicie su trámite de jubilación aquí"
    Y no se muestra la alerta "Ud. se encuentra en condiciones de jubilarse"
    Y el botón "Proyectar" está habilitado

  @AC-05 @RF-02 @RF-11
  Escenario: Afiliado sin beneficios alcanzados proyecta sin botón de trámite
    Dado que la fecha mínima de Jubilación Parcial es mañana
    Y que la fecha mínima de Jubilación Ordinaria es mañana
    Cuando ingresa al módulo de proyección
    Entonces no se muestra el botón "Inicie su trámite de jubilación aquí"
    Y no se muestra la alerta "Ud. se encuentra en condiciones de jubilarse"
    Y el botón "Proyectar" está habilitado

  # ---------------------------------------------------------------
  # Preselección y elección de beneficio y fecha (RF-07, RF-03, RF-12, RF-04)
  # ---------------------------------------------------------------

  @RF-07
  Esquema del escenario: Se preselecciona el beneficio con la menor fecha mínima
    Dado que la fecha mínima de Jubilación Parcial es <fecha parcial>
    Y que la fecha mínima de Jubilación Ordinaria es <fecha ordinaria>
    Cuando ingresa al módulo de proyección
    Entonces está preseleccionado el beneficio "<beneficio>"
    Y está preseleccionada la fecha <fecha preseleccionada>

    @AC-06
    Ejemplos: Parcial anterior a Ordinaria
      | fecha parcial | fecha ordinaria | beneficio           | fecha preseleccionada |
      | hoy + 1 año   | hoy + 5 años    | Jubilación Parcial  | hoy + 1 año           |

    @AC-07
    Ejemplos: Fechas iguales y posteriores a hoy (desempate)
      | fecha parcial | fecha ordinaria | beneficio           | fecha preseleccionada |
      | hoy + 5 años  | hoy + 5 años    | Jubilación Ordinaria | hoy + 5 años          |

    @AC-08
    Ejemplos: Parcial anterior a hoy y Ordinaria posterior a hoy
      | fecha parcial | fecha ordinaria | beneficio           | fecha preseleccionada |
      | hoy - 1 año   | hoy + 4 años    | Jubilación Parcial  | hoy - 1 año           |

  @AC-09 @RF-03
  Escenario: Al cambiar de beneficio, la fecha pasa a la mínima del nuevo beneficio
    Dado que la fecha mínima de Jubilación Parcial es hoy + 1 año
    Y que la fecha mínima de Jubilación Ordinaria es hoy + 5 años
    Y que ingresó al módulo de proyección
    Y que eligió la fecha hoy + 2 años para Jubilación Parcial
    Cuando cambia el beneficio a "Jubilación Ordinaria"
    Entonces la fecha elegida es hoy + 5 años

  @AC-10 @RF-12
  Escenario: El afiliado elige una fecha distinta de la propuesta
    Dado que ingresó al módulo de proyección con la fecha mínima F preseleccionada
    Cuando elige en el selector la fecha F + 1 año
    Entonces la fecha elegida es F + 1 año

  @AC-11 @RF-04
  Escenario: El selector deshabilita los días anteriores a la fecha mínima (caso límite)
    Dado que ingresó al módulo de proyección con un beneficio elegido de fecha mínima F
    Cuando abre el selector de fecha
    Entonces el día F está habilitado
    Y el día F - 1 está deshabilitado

  @AC-12 @RF-04
  Escenario: No se puede escribir la fecha a mano
    Dado que ingresó al módulo de proyección
    Cuando intenta escribir una fecha con el teclado en el selector de fecha
    Entonces la fecha elegida no cambia

  # ---------------------------------------------------------------
  # Estado de matrícula (RF-05)
  # ---------------------------------------------------------------

  @AC-13 @RF-05
  Escenario: Afiliado con matrícula "fallecido" no puede proyectar
    Dado que el estado de matrícula del afiliado es "fallecido"
    Cuando ingresa al módulo de proyección
    Entonces se muestra la alerta "No es posible realizar proyección para afiliados con estado matricular fallecido"
    Y el botón "Proyectar" está deshabilitado

  @AC-14 @RF-05
  Esquema del escenario: Los demás estados de matrícula pueden proyectar
    Dado que el estado de matrícula del afiliado es "<estado>"
    Y que las dos fechas mínimas son posteriores a hoy
    Cuando ingresa al módulo de proyección
    Entonces no se muestra la alerta "No es posible realizar proyección para afiliados con estado matricular fallecido"
    Y el botón "Proyectar" está habilitado

    Ejemplos:
      | estado     |
      | activa     |
      | cancelado  |
      | suspendido |

  # ---------------------------------------------------------------
  # Generación del PDF y errores (RF-06, RF-08, RF-09, RF-10)
  # ---------------------------------------------------------------

  @AC-15 @RF-06 @RF-08
  Escenario: En escritorio el PDF se abre en una nueva pestaña con los datos elegidos
    Dado que el estado de matrícula del afiliado es "activa"
    Y que eligió el beneficio B y la fecha D
    Y que usa un navegador de escritorio
    Cuando hace clic en "Proyectar"
    Entonces el PDF se abre en una nueva pestaña
    Y el PDF muestra el beneficio B y la fecha D
    Y el PDF contiene los mismos datos que el PDF que genera el sitio actual para el mismo afiliado, beneficio y fecha

  @AC-16 @RF-08
  Esquema del escenario: En celular el PDF se abre en una pestaña o en el visor del dispositivo
    Dado que el estado de matrícula del afiliado es "activa"
    Y que eligió el beneficio B y la fecha D
    Y que usa <navegador>
    Cuando hace clic en "Proyectar"
    Entonces el PDF se abre en una nueva pestaña o en el visor de PDF del dispositivo
    Y el PDF no queda solo como descarga

    Ejemplos:
      | navegador          |
      | Chrome en Android  |
      | Safari en iOS      |

  @AC-17 @RF-09
  Escenario: Mientras espera la respuesta se muestra la carga y no se puede volver a hacer clic
    Dado que el servicio de proyección tarda en responder
    Cuando hace clic en "Proyectar"
    Entonces mientras espera se muestra el indicador de carga
    Y el botón "Proyectar" está deshabilitado
    Y un segundo clic no envía otra solicitud

  @AC-18 @RF-10
  Escenario: El servicio de proyección devuelve un error
    Dado que el servicio de proyección devuelve un error
    Cuando hace clic en "Proyectar"
    Entonces se muestra el mensaje "No pudimos generar su proyección. Intente nuevamente."
    Y el botón "Proyectar" vuelve a estar habilitado

  @AC-19 @RF-10
  Escenario: El servicio de proyección no responde en 10 segundos
    Dado que el servicio de proyección no responde
    Cuando hace clic en "Proyectar"
    Entonces a los 10 segundos se muestra el mensaje "No pudimos generar su proyección. Intente nuevamente."
    Y el botón "Proyectar" vuelve a estar habilitado

  # ---------------------------------------------------------------
  # No funcionales (RNF-01 a RNF-05)
  # ---------------------------------------------------------------

  @AC-20 @RNF-01 @manual
  Escenario: El p95 del tiempo de generación del reporte es menor a 2 segundos
    Dado el período de medición en producción del 01/03/2027 al 31/03/2027
    Cuando se calcula el tiempo desde que el frontend llama al servicio de generación del PDF hasta que recibe la respuesta completa
    Entonces el p95 es menor a 2 segundos

  @AC-21 @RNF-02
  Escenario: Con los valores por defecto se genera el PDF con 1 clic
    Dado que el estado de matrícula del afiliado es "activa"
    Y que las dos fechas mínimas son posteriores a hoy
    Y que ingresó al módulo de proyección
    Cuando hace 1 clic en "Proyectar" sin cambiar ningún valor
    Entonces se genera el PDF

  @AC-22 @RNF-03
  Esquema del escenario: La pantalla se ve completa en todos los tamaños
    Dado que la pantalla de proyección tiene los valores por defecto
    Cuando se ve en una pantalla de <tamaño> px
    Entonces no hay scroll horizontal
    Y no hay elementos superpuestos ni textos cortados
    Y el botón "Proyectar" se ve sin scroll vertical
    Y el PDF se abre y se puede ver con el visor del navegador o del dispositivo

    Ejemplos:
      | tamaño    |
      | 360x640   |
      | 768x1024  |
      | 1024x768  |
      | 1920x1080 |

  @AC-23 @RNF-04 @manual
  Escenario: La pantalla cumple los valores de accesibilidad
    Dado la pantalla de proyección
    Cuando se audita con una herramienta automática de accesibilidad y se miden los elementos
    Entonces el contraste es mayor o igual a 4,5:1 en el texto normal y a 3:1 en el texto grande
    Y el texto base mide 18 px o más
    Y las áreas táctiles miden 44x44 px o más
    Y las áreas táctiles están separadas por 8 px o más

  @AC-24 @RNF-05
  Esquema del escenario: Los escenarios funcionales pasan en los 5 navegadores
    Dado que se usa <navegador> en su última versión estable
    Cuando se ejecutan los escenarios de AC-01 a AC-19
    Entonces todos pasan

    Ejemplos:
      | navegador         |
      | Chrome            |
      | Edge              |
      | Firefox           |
      | Chrome en Android |
      | Safari en iOS     |
