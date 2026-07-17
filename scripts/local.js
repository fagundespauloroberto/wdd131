function calcularSensacaoTermica(tempC, speed) {
    return 13.12 + (0.6215 * tempC) - (11.37 * Math.pow(speed, 0.16)) + (0.3965 * tempC * Math.pow(speed, 0.16));
}

document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById("ano-atual").textContent = new Date().getFullYear();
    document.getElementById("ultima-modificacao").textContent = document.lastModified;

    const tempC = 10; //temperatura estática do local (Celsius)
    const speed = 5;  // velocidade do vento estática (km/h)

    const wcfElement = document.getElementById("wcf");

    if (tempC <= 10 && speed > 4.8) {
        const sensacao = calcularSensacaoTermica(tempC, speed);
        wcfElement.textContent = `${sensacao.toFixed(1)} °C`;
    } else {
        wcfElement.textContent = "N/A";
    }
});