/**
 * @swagger
 * components:
 *   schemas:
 *     Hospitals:
 *       type: object
 *       required:
 *         - facility_id
 *         - facility_code
 *         - facility_name
 *         - status
 *         - created_at
 *         - updated_at
 *       properties:
 *         facility_id:
 *           type: int
 *           description: The auto-generated id of the facility
 *         facility_code:
 *           type: string
 *           description: A unique code to identify a hospital
 *         facility_name:
 *           type: string
 *           description: The name of the facility
 *         status:
 *           type: string
 *           enum:
 *             - "active"
 *             - "inactive"
 *          description: A status to determine if the hospital is active or inactive
 *         created_at:
 *           type: string
 *           format: date
 *           description: The date the hospital was added
 *       example:
 *         facility_id: 1
 *         facility_code: kcmc
 *         facility_name: KCMC Hospital
 *         status: active
 *         created_at: 2020-03-10 04:05:06
 *     Builds:
 *       type: object
 *       required:
 *         - build_id
 *         - description
 *         - encrypted_path
 *         - build_path
 *         - created_at
 *         - updated_at
 *       properties:
 *         build_id:
 *           type: int
 *           description: The auto-generated id of the build
 *         description:
 *           type: string
 *           format: text
 *           description: A description to show information about the build
 *         encrypted_path:
 *           type: string
 *           description: Path of the encrypted.zip file
 *         build_path:
 *           type: string
 *           description: Path of the build.zip file
 *         created_at:
 *           type: string
 *           format: date
 *           description: The date the hospital was added
 *         updated_at:
 *           type: string
 *           format: date
 *           description: The date the hospital was added
 *       properties:
 *       example:
 *         build_id: 1
 *         description: kcmc
 *         encrypted_path: /builds/encrypted.zip
 *         build_path: /builds/build.zip
 *         created_at: 2020-03-10 04:05:06
 *         updated_at: 2020-03-10 04:05:06
 */
const express = require("express");
const os = require("os");
const path = require("path");
const fs = require("fs");
const zipFolder = require("zip-folder");
const { logToFile } = require("../helper");
const { execSync } = require("child_process");
const upload = require("../upload");

const router = express.Router();
const {
  getHospitals,
  createHospital,
  updateHospital,
} = require("../services/hospitalsService");

const {
  getHospitalUpdates,
  getHospitalSpecifiedUpdates,
  updateHospitalSpecificUpdate,
  addHospitalUpdate,
  bulkInsert,
  uploadEncryptedzip,
  uploadBuildzip,
  getBuilds,
  getSingleBuild,
} = require("../services/updateService");

/* GET programming languages. */
router.get("/hospitals", async function (req, res, next) {
  try {
    res.json(await getHospitals(req.query.page));
  } catch (err) {
    console.error(`Error while getting hospitals `, err.message);
    next(err);
  }
});

router.post("/hospitals", async function (req, res, next) {
  try {
    res.json(await createHospital(req.body));
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
});

router.post("/hospitals/:id", async function (req, res, next) {
  try {
    res.json(await updateHospital(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while creating programming language`, err.message);
    next(err);
  }
});

router.get("/get-updates", async function (req, res, next) {
  try {
    res.json(await getHospitalUpdates(req.body?.page));
  } catch (err) {
    console.error(`Error while getting updates`, err.message);
    next(err);
  }
});

router.get("/get-update/:facility", async function (req, res, next) {
  try {
    res.json(
      await getHospitalSpecifiedUpdates(req.body?.page, req.params.facility)
    );
  } catch (err) {
    console.error(`Error while getting updates`, err.message);
    next(err);
  }
});
router.post("/put-update/:facility", async function (req, res, next) {
  try {
    res.json(await updateHospitalSpecificUpdate(req.params.facility, req.body));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});
router.post("/add-update/:facility", async function (req, res, next) {
  try {
    await addHospitalUpdate(req.params.facility, res);
  } catch (err) {
    console.error(`Error while adding`, err.message);
    next(err);
  }
});
router.post("/add-updates/bulk-insert", async function (req, res, next) {
  try {
    await bulkInsert(res);
  } catch (err) {
    console.error(`Error while adding`, err.message);
    next(err);
  }
});

router.get("/download/:facility", function (req, res) {
  const token =
    req.body.token || req.query.token || req.headers["Authorization"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  if (
    token.trim() === "6cC2bCiO1CvrWiAbK8yv8CX6xAJXTAde1MGTYdTY4ShJHBuITvVk="
  ) {
    const homedir = os.homedir();
    let  dirPath = "/var/www/html/production";
const facility = req.params.facility;
   if(facility=='moh'){
    dirPath = "/var/www/html/moh";
}
    // const dirPath = path.join("/var/www/html/", "build");
    const buildPath = path.join(dirPath, "build");
    const zipName = "build.zip";
    const outputPath = path.join(dirPath, zipName);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
    res.sendFile(outputPath);
  } else {
    return res.status(401).send("Invalid Token");
  }
});

router.get("/download-backend", function (req, res) {
  const token =
    req.body.token || req.query.token || req.headers["Authorization"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  if (
    token.trim() === "jKMsEVNePb273Y3qwjV9VmGho=|ccGmq34z5zprXFmAGXVk/kTeOv4="
  ) {
    const homedir = os.homedir();
    const zipPath = path.join(
      homedir,
      "hospital-builds/ehms-backend/encrypted.zip"
    );
    const folderName = "encrypted";

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${folderName}.zip`
    );
    res.sendFile(zipPath);
  } else {
    return res.status(401).send("Invalid Token");
  }
});

router.get("/download-backend-moh", function (req, res) {
  const token =
    req.body.token || req.query.token || req.headers["Authorization"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  if (
    token.trim() === "jKMsEVNePb273Y3qwjV9VmGho=|ccGmq34z5zprXFmAGXVk/kTeOv4="
  ) {
    const homedir = os.homedir();
    const zipPath = "/var/www/html/moh/encrypted.zip";
    const folderName = "encrypted";

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${folderName}.zip`
    );
    res.sendFile(zipPath);
  } else {
    return res.status(401).send("Invalid Token");
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(422).json({ error: "No file uploaded." });
  }
  const uploadedFile = req.file;
  // const originalFileName = uploadedFile.originalname;
  // const filePath = uploadedFile.path;
  // return uploadBuildzip(res, req.body, filePath);
  res
    .status(200)
    .send({ message: "File uploaded successfully!", file: uploadedFile });
});

router.post("/upload-build", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(422).json({ error: "No file uploaded." });
  }
  const uploadedFile = req.file;
  const originalFileName = uploadedFile.originalname;
  const filePath = uploadedFile.destination + uploadedFile.filename;

  return uploadBuildzip(res, req.body, filePath);
  // res.status(200).send({ message: "File uploaded successfully!" });
});

router.post("/upload-encrypted", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const uploadedFile = req.file;
  const originalFileName = uploadedFile.originalname;
  const filePath = uploadedFile.destination + uploadedFile.filename;

  return uploadEncryptedzip(res, req.body, filePath);
});

router.get("/get-builds", async (req, res) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["Authorization"] ||
    req.headers["authorization"];
  console.log(req.headers);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  if (
    token.trim() === "jKMsEVNePb273Y3qwjV9VmGho=|ccGmq34z5zprXFmAGXVk/kTeOv4="
  ) {
    try {
      const body = {
        ...req.body,
        buildId: req.body.buildId || req.query.buildId,
      };
      res.json(await getBuilds(body, res));
    } catch (err) {
      console.error(`Error while getting updates`, err.message);
      next(err);
    }
  } else {
    return res.status(401).send("Invalid Token");
  }
});

router.get("/single-build", async (req, res) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["Authorization"] ||
    req.headers["authorization"];
  const uuid = req.body.uuid || req.query.uuid;
  if (!uuid) {
    return res.status(422).send("uuid is required");
  }
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  if (
    token.trim() === "jKMsEVNePb273Y3qwjV9VmGho=|ccGmq34z5zprXFmAGXVk/kTeOv4="
  ) {
    try {
      const body = {
        ...req.body,
        uuid: uuid,
      };
      const response = await getSingleBuild(body, res);
      if (response.length) {
        res.json(response[0]);
      } else {
        res.status(404).send("No build with that UUID");
      }
    } catch (err) {
      console.error(`Error while getting updates`, err.message);
      next(err);
    }
  } else {
    return res.status(401).send("Invalid Token");
  }
});

module.exports = router;
