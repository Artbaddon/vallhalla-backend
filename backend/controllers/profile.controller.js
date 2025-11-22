import ProfileModel from "../models/profile.model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ROLES } from "../middleware/rbacConfig.js";

const PROFILE_UPLOAD_FIELD_NAMES = [
  'profile_photo',
  'Profile_photo',
  'profilePhoto',
  'ProfilePhoto',
  'profile_image',
  'ProfileImage',
  'photo_url',
  'photoUrl',
  'photo',
  'file',
  'image'
];
const PROFILE_UPLOAD_PUBLIC_PATH = '/uploads/profiles';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const UPLOADS_ROOT = path.join(PROJECT_ROOT, 'uploads');
const PROFILE_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'profiles');
const UPLOADS_ROOT_LOWER = UPLOADS_ROOT.toLowerCase();
const { promises: fsPromises } = fs;
const PROFILE_BASE64_FIELD_NAMES = [...new Set([
  ...PROFILE_UPLOAD_FIELD_NAMES,
  'profilePhoto',
  'ProfilePhoto',
  'profile_photo_base64',
  'profilePhotoBase64',
  'profileBase64',
  'profile_image_base64',
  'profileImageBase64',
  'ProfileImageBase64',
  'photoUrl',
  'photoURL',
  'photo_url',
  'photo_data',
  'photoData',
  'avatar',
  'avatarBase64',
  'image',
  'imageBase64'
])];
const BASE64_DATA_URL_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;
const BASE64_RAW_REGEX = /^[A-Za-z0-9+/=]+$/;
const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg'
};

const ensureProfileUploadDir = () => {
  if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
    fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
  }
  return PROFILE_UPLOAD_DIR;
};

const buildPublicPhotoPath = (filename) => path.posix.join(PROFILE_UPLOAD_PUBLIC_PATH, filename);
const getDiskPathForFile = (file) => {
  if (!file) return null;
  if (file.path) return file.path;
  if (file.destination && file.filename) {
    return path.join(file.destination, file.filename);
  }
  return null;
};

const extractUploadedProfileFile = (files = []) => {
  if (!Array.isArray(files) || files.length === 0) return null;
  const prioritized = files.find((file) => PROFILE_UPLOAD_FIELD_NAMES.includes(file.fieldname));
  return prioritized ?? files[0];
};

const resolveUploadedFilePath = (storedPath) => {
  if (!storedPath) return null;
  if (path.isAbsolute(storedPath)) {
    return storedPath;
  }
  const sanitized = storedPath.replace(/^[/\\]+/, '');
  return path.resolve(PROJECT_ROOT, sanitized);
};

const cleanupFileQuietly = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const extractBase64ImageEntry = (body = {}) => {
  if (!body || typeof body !== 'object') return null;
  for (const fieldName of PROFILE_BASE64_FIELD_NAMES) {
    const value = body[fieldName];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.length < 80) continue;
    const dataUrlMatch = BASE64_DATA_URL_REGEX.exec(trimmed);
    if (dataUrlMatch) {
      return {
        field: fieldName,
        mimeType: dataUrlMatch[1].toLowerCase(),
        base64Payload: dataUrlMatch[2].replace(/\s+/g, ''),
        original: trimmed
      };
    }
    if (BASE64_RAW_REGEX.test(trimmed) && trimmed.length % 4 === 0) {
      const mimeType = body[`${fieldName}_mime`] || body[`${fieldName}Mime`] || 'image/png';
      return {
        field: fieldName,
        mimeType: String(mimeType).toLowerCase(),
        base64Payload: trimmed,
        original: trimmed
      };
    }
  }
  return null;
};

const saveBase64Image = async (entry) => {
  if (!entry) return null;
  try {
    await ensureProfileUploadDir();
    const mimeType = entry.mimeType || 'image/png';
    const normalizedMime = mimeType.toLowerCase();
    const extension = MIME_EXTENSION_MAP[normalizedMime] || normalizedMime.split('/')[1] || 'png';
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const absolutePath = path.join(PROFILE_UPLOAD_DIR, filename);
    const buffer = Buffer.from(entry.base64Payload, 'base64');
    await fsPromises.writeFile(absolutePath, buffer);
    console.log('[ProfileUpload] Saved base64 image as', absolutePath);
    return {
      filename,
      absolutePath,
      publicPath: buildPublicPhotoPath(filename),
      field: entry.field
    };
  } catch (error) {
    console.error('Error saving base64 profile photo:', error);
    return null;
  }
};

const resolveIncomingProfilePhoto = async (req, body = {}) => {
  if (req.file) {
    return {
      publicPath: buildPublicPhotoPath(req.file.filename),
      diskPath: getDiskPathForFile(req.file),
      source: req.file.fieldname || 'file'
    };
  }

  const base64Entry = extractBase64ImageEntry(body);
  if (base64Entry) {
    const saved = await saveBase64Image(base64Entry);
    if (saved?.field) {
      delete body[saved.field];
    }
    if (saved) {
      return {
        publicPath: saved.publicPath,
        diskPath: saved.absolutePath,
        source: base64Entry.field
      };
    }
  }

  return { publicPath: null, diskPath: null, source: null };
};

// Create profile upload function
const createProfileUpload = () => {
  const uploadDir = ensureProfileUploadDir();
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '')}`;
      cb(null, uniqueName);
    }
  });

  const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit guards uploads
    fileFilter: (req, file, cb) => {
      if (file?.mimetype?.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files allowed!'), false);
      }
    }
  }).any();

  return (req, res, cb) => {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('multipart/form-data')) {
      console.log('[ProfileUpload] Skipping multer; content-type =', contentType || 'none');
      return cb();
    }

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return cb(err);
      }

      const allUploadedFiles = Array.isArray(req.files) ? req.files : [];
      if (allUploadedFiles.length > 1) {
        const primaryFile = extractUploadedProfileFile(allUploadedFiles);
        const filesToRemove = allUploadedFiles.filter((file) => file !== primaryFile);
        filesToRemove.forEach((file) => {
          const filePath = file?.path ?? path.join(PROFILE_UPLOAD_DIR, file.filename ?? '');
          if (filePath) {
            fs.unlink(filePath, () => {});
          }
        });
        if (!primaryFile) {
          return cb(new Error('Only one profile photo is allowed per request'));
        }
        req.files = [primaryFile];
      }

      const uploadedFile = extractUploadedProfileFile(req.files);
      if (uploadedFile) {
        console.log('[ProfileUpload] Stored file:', uploadedFile.filename, 'at', uploadedFile.path);
        req.file = uploadedFile;
      }

      cb();
    });
  };
};

class ProfileController {
  async register(req, res) {
    const profileUpload = createProfileUpload();
    
    profileUpload(req, res, async (err) => {
      // Handle upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      const filesToCleanup = new Set();
      try {
        const {
          Profile_fullName,
          Profile_document_type,
          Profile_document_number,
          Profile_telephone_number
        } = req.body;
        
        // Get user ID from the authenticated user
        const User_FK_ID = req.user.userId;
        
        const uploadResult = await resolveIncomingProfilePhoto(req, req.body);
        if (uploadResult.diskPath) {
          filesToCleanup.add(uploadResult.diskPath);
        }

        const Profile_photo = uploadResult.publicPath;
        
        const profileId = await ProfileModel.create({
          User_FK_ID,
          Profile_fullName,
          Profile_document_type,
          Profile_document_number,
          Profile_telephone_number,
          Profile_photo
        });
        
        if (profileId.error) {
          filesToCleanup.forEach(cleanupFileQuietly);
          return res.status(400).json({ error: profileId.error });
        }
        
        filesToCleanup.clear();
        const response = { 
          message: "Profile created successfully", 
          id: profileId 
        };
        
        // Only include photo_url in response if file was uploaded
        if (Profile_photo) {
          response.photo_url = Profile_photo;
        }
        
        res.status(201).json(response);
      } catch (error) {
        filesToCleanup.forEach(cleanupFileQuietly);
        console.error('Error creating profile:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }
  async show(req, res) {
    try {
      const profiles = await ProfileModel.show();
      if (!profiles) {
        return res.status(409).json({ error: "No profiles found" });
      }
      res
        .status(200)
        .json({ message: "Profiles retrieved successfully", profiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    const profileUpload = createProfileUpload();
    
    profileUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      const filesToCleanup = new Set();
      try {
        const id = req.params.id;
        const updateData = { ...req.body };

        const pendingDiskPath = getDiskPathForFile(req.file);
        if (pendingDiskPath) {
          filesToCleanup.add(pendingDiskPath);
        }

        const existingProfile = await ProfileModel.findById(id);

        if (!existingProfile || existingProfile.error) {
          filesToCleanup.forEach(cleanupFileQuietly);
          if (!existingProfile) {
            return res.status(404).json({ message: "Profile not found" });
          }
          return res.status(500).json({ error: existingProfile.error });
        }
        
        const uploadResult = await resolveIncomingProfilePhoto(req, updateData);
        if (uploadResult.diskPath) {
          filesToCleanup.add(uploadResult.diskPath);
        }

        if (uploadResult.publicPath) {
          updateData.Profile_photo = uploadResult.publicPath;
        }
        // If no file or base64 uploaded, don't change existing photo_url
        
        const result = await ProfileModel.update(id, updateData);
        
        if (result.error) {
          filesToCleanup.forEach(cleanupFileQuietly);
          return res.status(400).json({ error: result.error });
        }

        if (result.affectedRows === 0) {
          filesToCleanup.forEach(cleanupFileQuietly);
          return res.status(404).json({ message: "Profile not found" });
        }
        
        filesToCleanup.clear();
        const response = { message: "Profile updated successfully" };
        
        // Include new photo URL if uploaded
        if (uploadResult.publicPath) {
          response.photo_url = result.photo ?? updateData.Profile_photo ?? uploadResult.publicPath;

          const previousPhoto = existingProfile?.Profile_photo;
          if (previousPhoto) {
            const normalizedNew = (updateData.Profile_photo || '').replace(/^[/\\]+/, "");
            const normalizedPath = previousPhoto.replace(/^[/\\]+/, "");
            if (normalizedPath && normalizedPath !== normalizedNew) {
              const absolutePath = resolveUploadedFilePath(previousPhoto);
              if (absolutePath && absolutePath.toLowerCase().startsWith(UPLOADS_ROOT_LOWER)) {
                fs.unlink(absolutePath, () => {});
              }
            }
          }
        }
        
        res.json(response);
      } catch (error) {
        filesToCleanup.forEach(cleanupFileQuietly);
        res.status(500).json({ error: error.message });
      }
    });
  }
  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const deleteProfile = await ProfileModel.delete(id);
      if (!deleteProfile || deleteProfile.error) {
        return res
          .status(404)
          .json({ error: deleteProfile?.error || "Profile not found" });
      }
      res
        .status(200)
        .json({ message: "Profile deleted successfully", id: deleteProfile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Profile ID is required" });
      }

      const profile = await ProfileModel.findById(id);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // If user is an owner, verify they're accessing their own profile
      if (req.user.roleId === ROLES.OWNER && profile.User_FK_ID !== req.user.userId) {
        return res.status(403).json({ error: "You don't have permission to access this profile" });
      }

      res.status(200).json({
        message: "Profile found successfully",
        profile: profile,
      });
    } catch (error) {
      console.error("Error finding profile by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async getMyProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID could not be determined" });
      }

      const profile = await ProfileModel.findByUserId(userId);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.status(200).json({
        message: "Your profile retrieved successfully",
        profile: profile,
      });
    } catch (error) {
      console.error("Error retrieving profile:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProfileController();
