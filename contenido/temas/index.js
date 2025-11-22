// Índice de todos los temas de documentación
// Variable global para ser usada en loader.js

const temasPrestaShop = {
    // Arquitectura y Conceptos de PrestaShop
    'ciclo-vida-peticiones-prestashop': cicloVidaPeticiones,
    'estructura-modulos-temas': estructuraModulosTemas,
    'overrides-clases-controladores': overridesClasesControladores,
    'hooks-eventos-prestashop': hooksYEventos,
    'modelo-datos-prestashop': modeloDatosPrestaShop,
    'configuracion-multitienda-multiidioma': configuracionMultitiendaIdioma,
    'cache-prestashop-smarty-apcu': cachePrestaShopSmartyApcu,

    // Desarrollo de Módulos Avanzados
    'creacion-controladores-front-back': creacionControladoresFrontBack,
    'uso-orm-prestashop': usoOrmPrestaShop,
    'configuracion-modulos-back-office': configuracionModulosBackOffice,
    'gestion-activos-css-js': gestionActivosCssJs,
    'internacionalizacion-traducciones-modulos': internacionalizacionTraduccionesModulos,
    'integracion-web-services-prestashop': integracionWebServicesPrestaShop,
    'buenas-practicas-estandares-modulos': buenasPracticasEstandaresModulos,

    // Desarrollo de Temas Personalizados
    'estructura-tema-classic-starter': estructuraTemaClassicStarter,
    'sobreescritura-plantillas-smarty-twig': sobreescrituraPlantillasSmartyTwig,
    'integracion-modulos-tema': integracionModulosTema,
    'personalizacion-css-sass-javascript': personalizacionCssSassJavascript,
    'optimizacion-rendimiento-tema': optimizacionRendimientoTema,
    'responsive-design-adaptacion-movil': responsiveDesignAdaptacionMovil,
    'creacion-paginas-layouts-personalizados': creacionPaginasLayoutsPersonalizados,

    // Bases de Datos y SQL Avanzado
    'mantenimiento-optimizacion-prestashop': mantenimientoOptimizacionPrestaShop,
    'diseno-bases-datos-relacionales': disenoBasesDatosRelacionales,
    'sql-avanzado': sqlAvanzado,
    'modelado-entidad-relacion': modeladoEntidadRelacion,
    'normalizacion-bases-datos': normalizacionBasesDatos,
    'tipos-relaciones': tiposRelaciones,
    'indices-claves': indicesClaves,
    'patrones-diseno-esquemas': patronesDisenoEsquemas,
    'integridad-referencial': integridadReferencial,
    'desnormalizacion-estrategica': desnormalizacionEstrategica,
    
    // SQL Avanzado - Nuevos temas
    'subconsultas-correlacionadas': subconsultasCorrelacionadas,
    'ctes-recursive': ctesRecursive,
    'funciones-ventana': funcionesVentana,
    'funciones-agregadas-having': funcionesAgregadasHaving,
    'joins-complejos': joinsComplejos,
    'transacciones-acid': transaccionesAcid,
    'vistas': vistasMatVirtuales,
    
    // Mantenimiento y Optimización de PrestaShop
    'gestion-cache': gestionLimpiezaCache,
    'optimizacion-bd': optimizacionBaseDatos,
    'monitorizacion-rendimiento': monitorizacionRendimiento,
    'actualizaciones-migraciones': actualizacionesMigraciones,
    'solucion-problemas': solucionProblemasDepuracion,
    'gestion-logs': gestionLogsErrores,
    'configuracion-cron-jobs': configuracionCronJobs,
    
    // Optimización y Administración de Bases de Datos
    'optimizacion-consultas': optimizacionConsultasExplain,
    'tuning-servidores': tuningServidoresBD,
    'backup-restauracion': backupRestauracionEstrategica,
    'particionamiento-tablas': particionamientoTablas,
    'replicacion-disponibilidad': replicacionAltaDisponibilidad,
    'seguridad-bd': seguridadBDPermisos,
    'monitoreo-rendimiento-bd': monitoreoRendimientoBD,
    
    // Diseño de APIs RESTful
    'principios-rest': principiosREST,
    'verbos-http': verbosHTTPSemantica,
    'codigos-estado-http': codigosEstadoHTTP,
    'versionado-apis': versionadoAPIs,
    'paginacion-filtrado': paginacionFiltradoBusqueda,
    'hateoas': hateoas,
    'documentacion-apis': documentacionAPIs,
    
    // Implementación de APIs con Symfony
    'controladores-api': creacionControladoresAPI,
    'serializacion': serializacionDeserializacion,
    'manejo-errores-apis': manejoErroresExcepciones,
    'autenticacion-apis': autenticacionAutorizacionAPIs,
    'rate-limiting': rateLimitingThrottling,
    'cache-apis': cacheAPIs,
    'consumo-apis-externas': consumoAPIsExternas,
    
    // Contenedores y Docker
    'conceptos-contenedores': conceptosBasicosContenedores,
    'docker-arquitectura': arquitecturaDocker,
    'imagenes-contenedores': imagenesContenedores,
    'almacenamiento-contenedores': almacenamientoContenedores,
    'redes-docker': redesDocker,
    'docker-hub-registries': dockerHubRegistries,
    'buenas-practicas-docker': buenasPracticasDocker,
    
    // Docker Compose y Orquestación
    'introduccion-docker-compose': introduccionDockerCompose,
    'archivos-docker-compose': archivosDockerCompose,
    'variables-entorno': variablesEntornoSecrets,
    'redes-volumenes-compose': redesVolumenesCompose,
    'orquestacion-contenedores': orquestacionMultiplesContenedores,
    'perfiles-docker-compose': perfilesDockerCompose,
    'depuracion-docker-compose': depuracionResolucionProblemas,
    
    // Docker en Entornos de Producción
    'seguridad-docker': seguridadDocker,
    'monitoreo-contenedores': monitoreoContenedores,
    'logging-docker': loggingDocker,
    'escalado-contenedores': escaladoContenedores,
    'docker-swarm': dockerSwarmOrquestacion,
    'kubernetes-basico': introduccionKubernetes,
    'ci-cd-docker': cicdDocker,
    
    // Gestión y Orquestación de Contenedores para PrestaShop
    'estrategias-despliegue-docker': estrategiasDespliegueDocker,
    'integracion-docker-ci-cd': integracionDockerCICD,
    'seguridad-contenedores': seguridadContenedoresPrestashop,
    'monitorizacion-contenedores': monitorizacionContenedoresPrestashop,
    'almacenamiento-persistente': almacenamientoPersistenteProduccion,
    'optimizacion-imagenes': optimizacionImagenesDocker,
    'introduccion-orquestadores': introduccionOrquestadoresPrestashop,
};
