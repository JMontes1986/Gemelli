// apps/chain/scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando despliegue de GemelliAuditLog...\n");

  // Obtener el deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);

  // Verificar balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "MATIC\n");

  if (balance === 0n) {
    console.error("❌ Error: La cuenta no tiene fondos");
    console.log("💡 Obtén MATIC gratis en: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Desplegar contrato
  console.log("📦 Compilando contrato...");
  const GemelliAuditLog = await hre.ethers.getContractFactory("GemelliAuditLog");
  
  console.log("⏳ Desplegando contrato...");
  const contract = await GemelliAuditLog.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Contrato desplegado exitosamente!");
  console.log("📍 Dirección:", contractAddress);
  console.log("🔗 Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}\n`);

  // Guardar información del despliegue
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    transactionHash: contract.deploymentTransaction().hash,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-${Date.now()}.json`
  );
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Información guardada en:", deploymentFile);

  // Guardar ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/GemelliAuditLog.sol/GemelliAuditLog.json"
  );
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, `${hre.network.name}-abi.json`);
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log("📄 ABI guardado en:", abiFile);
  }

  // Verificar funciones básicas
  console.log("\n🔍 Verificando funciones del contrato...");
  
  const version = await contract.version();
  console.log("   ✓ Version:", version);
  
  const contractName = await contract.contractName();
  console.log("   ✓ Nombre:", contractName);
  
  const owner = await contract.owner();
  console.log("   ✓ Owner:", owner);
  
  const totalRecords = await contract.totalRecords();
  console.log("   ✓ Total Records:", totalRecords.toString());

  // Probar registro de un evento
  console.log("\n🧪 Probando registro de evento...");
  
  const testHash = hre.ethers.id("test-event-" + Date.now());
  const testEntityId = hre.ethers.id("test-entity-123");
  
  const tx = await contract.record(
    testHash,
    1, // UPDATE_DEVICE
    testEntityId,
    JSON.stringify({ test: true, timestamp: Date.now() })
  );
  
  console.log("   ⏳ Esperando confirmación...");
  const receipt = await tx.wait();
  
  console.log("   ✓ Evento registrado!");
  console.log("   📝 TX Hash:", receipt.hash);
  console.log("   ⛽ Gas usado:", receipt.gasUsed.toString());

  // Verificar el registro
  const [exists, record] = await contract.verify(testHash);
  console.log("   ✓ Verificación:", exists ? "VÁLIDO ✅" : "INVÁLIDO ❌");

  // Instrucciones finales
  console.log("\n" + "=".repeat(70));
  console.log("🎉 DESPLIEGUE COMPLETADO");
  console.log("=".repeat(70));
  console.log("\n📋 SIGUIENTE PASOS:\n");
  console.log("1. Copia esta dirección a tu archivo .env:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}\n`);
  console.log("2. Verifica el contrato en PolygonScan:");
  console.log(`   npx hardhat verify --network amoy ${contractAddress}\n`);
  console.log("3. Agrega direcciones autorizadas si es necesario:");
  console.log(`   npx hardhat run scripts/add-authorized.js --network amoy\n`);
  console.log("4. Prueba el contrato:");
  console.log(`   npx hardhat test --network amoy\n`);
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante el despliegue:\n", error);
    process.exit(1);
  });
