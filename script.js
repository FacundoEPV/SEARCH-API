document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar el envío del formulario
    
    // Obtener la palabra clave del usuario
    const keyword = document.getElementById("keyword").value;

    // Cargar los archivos JSON y preparar el `formData`
    Promise.all([
        fetch('form.json').then(response => response.json()),
        fetch('displayFields.json').then(response => response.json()),
        fetch('sort.json').then(response => response.json())
    ])
    .then(([formConfig, displayFields, sortConfig]) => {
        // Modificar el query en `formConfig` con la palabra clave
        formConfig.bool.must[1].bool.should.forEach(condition => {
            if (condition.phrase) {
                condition.phrase.query = keyword;
            }
        });

        // Configurar los parámetros de `form-data`
        const formData = new FormData();
        formData.append('apiKey', 'SEDIA');
        formData.append('text', keyword);
        formData.append('pageSize', '50');
        formData.append('pageNumber', '1');
        formData.append('sort', new Blob([JSON.stringify(sortConfig)], { type: 'application/json' }));
        formData.append('query', new Blob([JSON.stringify(formConfig)], { type: 'application/json' }));
        formData.append('languages', new Blob([JSON.stringify(["en"])], { type: 'application/json' }));
        formData.append('displayFields', new Blob([JSON.stringify(displayFields)], { type: 'application/json' }));

        // Realizar la solicitud a la API
        return fetch(`https://api.tech.ec.europa.eu/search-api/prod/rest/search`, {
            method: 'POST',
            body: formData
        });
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data.results || []); // Llamar a la función para mostrar los resultados
    })
    .catch(error => console.error("Error en la solicitud:", error));
});

// Función para mostrar los resultados en el frontend
function displayResults(results) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Limpiar resultados previos

    if (results && results.length > 0) {
        results.forEach(result => {
            const resultDiv = document.createElement("div");
            resultDiv.classList.add("result-item");

            // Acceder a los campos en la raíz o en `metadata`
            const title = result.title || (result.metadata && result.metadata.title && result.metadata.title[0]) || "No disponible";
            const frameworkProgramme = result.frameworkProgramme || (result.metadata && result.metadata.frameworkProgramme && result.metadata.frameworkProgramme[0]) || "No disponible";
            const callTitle = result.callTitle || (result.metadata && result.metadata.callTitle && result.metadata.callTitle[0]) || "No disponible";
            const callIdentifier = result.callIdentifier || (result.metadata && result.metadata.callIdentifier && result.metadata.callIdentifier[0]) || "No disponible";
            const typesOfAction = result.typesOfAction || (result.metadata && result.metadata.typesOfAction && result.metadata.typesOfAction[0]) || "No disponible";
            const deadlineDate = result.deadlineDate || (result.metadata && result.metadata.deadlineDate && result.metadata.deadlineDate[0]) || "No disponible";
            const url = result.url || (result.metadata && result.metadata.url && result.metadata.url[0]) || "No disponible";
            const descriptionByte = result.descriptionByte || (result.metadata && result.metadata.descriptionByte && result.metadata.descriptionByte[0]) || "No disponible";
            const topicConditions = result.topicConditions || (result.metadata && result.metadata.topicConditions && result.metadata.topicConditions[0]) || "No disponible";

            // Formatear y mostrar `budgetOverview` si está disponible
            let budgetOverview = result.budgetOverview || (result.metadata && result.metadata.budgetOverview && result.metadata.budgetOverview[0]);
            let formattedBudget = "No disponible";

            if (budgetOverview) {
                try {
                    // Convertir `budgetOverview` en objeto si es un JSON string
                    const budgetData = JSON.parse(budgetOverview);

                    // Extraer la información clave de `budgetOverview`
                    const year = budgetData.budgetYearsColumns ? budgetData.budgetYearsColumns[0] : "Año no disponible";
                    const actionDetails = budgetData.budgetTopicActionMap
                        ? Object.values(budgetData.budgetTopicActionMap)[0][0]
                        : null;

                    if (actionDetails) {
                        const action = actionDetails.action || "Acción no disponible";
                        const amount = actionDetails.budgetYearMap[year] || "Monto no disponible";
                        const openingDate = actionDetails.plannedOpeningDate || "Fecha de apertura no disponible";
                        const deadlineDates = actionDetails.deadlineDates ? actionDetails.deadlineDates.join(", ") : "Fecha límite no disponible";

                        formattedBudget = `
                            <p><strong>Año:</strong> ${year}</p>
                            <p><strong>Acción:</strong> ${action}</p>
                            <p><strong>Presupuesto:</strong> ${amount} €</p>
                            <p><strong>Fecha de apertura:</strong> ${openingDate}</p>
                            <p><strong>Fecha límite:</strong> ${deadlineDates}</p>
                        `;
                    }
                } catch (error) {
                    console.error("Error al formatear el presupuesto:", error);
                }
            }

            // Crear el HTML de cada resultado
            resultDiv.innerHTML = `
                <h3>${title}</h3>
                <p><strong>Programa:</strong> ${frameworkProgramme}</p>
                <p><strong>Identificador:</strong> ${callIdentifier}</p>
                <p><strong>Título de la Llamada:</strong> ${callTitle}</p>
                <p><strong>Tipo de Acción:</strong> ${typesOfAction}</p>
                <p><strong>Fecha Límite:</strong> ${deadlineDate}</p>
                <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
                <p><strong>Presupuesto:</strong> ${formattedBudget}</p>
                <p><strong>Descripción:</strong> ${descriptionByte}</p>
                <p><strong>Condiciones:</strong> ${topicConditions}</p>
            `;

            resultsContainer.appendChild(resultDiv);
        });
    } else {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}

document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar el envío del formulario
    
    // Obtener la palabra clave del usuario
    const keyword = document.getElementById("keyword").value;

    // Cargar los archivos JSON y preparar el `formData`
    Promise.all([
        fetch('form.json').then(response => response.json()),
        fetch('displayFields.json').then(response => response.json()),
        fetch('sort.json').then(response => response.json())
    ])
    .then(([formConfig, displayFields, sortConfig]) => {
        // Modificar el query en `formConfig` con la palabra clave
        formConfig.bool.must[1].bool.should.forEach(condition => {
            if (condition.phrase) {
                condition.phrase.query = keyword;
            }
        });

        // Configurar los parámetros de `form-data`
        const formData = new FormData();
        formData.append('apiKey', 'SEDIA');
        formData.append('text', keyword);
        formData.append('pageSize', '50');
        formData.append('pageNumber', '1');
        formData.append('sort', new Blob([JSON.stringify(sortConfig)], { type: 'application/json' }));
        formData.append('query', new Blob([JSON.stringify(formConfig)], { type: 'application/json' }));
        formData.append('languages', new Blob([JSON.stringify(["en"])], { type: 'application/json' }));
        formData.append('displayFields', new Blob([JSON.stringify(displayFields)], { type: 'application/json' }));

        // Realizar la solicitud a la API
        return fetch(`https://api.tech.ec.europa.eu/search-api/prod/rest/search`, {
            method: 'POST',
            body: formData
        });
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data.results || []); // Llamar a la función para mostrar los resultados
    })
    .catch(error => console.error("Error en la solicitud:", error));
});
