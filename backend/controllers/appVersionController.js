/**
 * App Version Controller
 * Quản lý phiên bản app và yêu cầu cập nhật
 */

const APP_VERSIONS = {
  worker: {
    currentVersion: '1.1.5', // Version hiện tại từ pubspec.yaml
    minRequiredVersion: '1.1.0', // Version tối thiểu được phép sử dụng
    latestVersion: '1.1.5', // Version mới nhất trên Play Store
    updateUrl:
      'https://play.google.com/store/apps/details?id=com.thohcm.workerapp', // URL Play Store
    forceUpdate: false, // Bắt buộc cập nhật hay không
    updateMessage: 'Cải thiện tính năng nạp ví và sửa lỗi!',
    features: [
      'Chỉ còn phương thức QR Banking - nhanh hơn',
      'Sửa lỗi upload ảnh chuyển khoản',
      'Tự động quay về ví sau upload thành công',
      'Cải thiện hiệu suất',
    ],
  },
  customer: {
    currentVersion: '1.0.0',
    minRequiredVersion: '1.0.0',
    latestVersion: '1.0.0',
    updateUrl:
      'https://play.google.com/store/apps/details?id=com.thohcm.customerapp',
    forceUpdate: false,
    updateMessage: 'Có phiên bản mới!',
    features: [],
  },
};

/**
 * GET /api/app-version/check
 * Kiểm tra version app
 */
exports.checkVersion = async (req, res) => {
  try {
    const { appType = 'worker', currentVersion } = req.query;

    if (!APP_VERSIONS[appType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid app type',
      });
    }

    const versionInfo = APP_VERSIONS[appType];
    const needsUpdate = compareVersions(
      currentVersion,
      versionInfo.latestVersion,
    );
    const forceUpdate =
      versionInfo.forceUpdate ||
      compareVersions(currentVersion, versionInfo.minRequiredVersion) < 0;

    res.json({
      success: true,
      data: {
        currentVersion: currentVersion,
        latestVersion: versionInfo.latestVersion,
        minRequiredVersion: versionInfo.minRequiredVersion,
        needsUpdate: needsUpdate < 0, // true nếu version hiện tại < latest
        forceUpdate: forceUpdate, // true nếu bắt buộc phải update
        updateUrl: versionInfo.updateUrl,
        updateMessage: versionInfo.updateMessage,
        features: versionInfo.features,
        releaseDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Check version error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra phiên bản',
      error: error.message,
    });
  }
};

/**
 * GET /api/app-version/latest
 * Lấy thông tin version mới nhất
 */
exports.getLatestVersion = async (req, res) => {
  try {
    const { appType = 'worker' } = req.query;

    if (!APP_VERSIONS[appType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid app type',
      });
    }

    const versionInfo = APP_VERSIONS[appType];

    res.json({
      success: true,
      data: {
        version: versionInfo.latestVersion,
        updateUrl: versionInfo.updateUrl,
        features: versionInfo.features,
        message: versionInfo.updateMessage,
      },
    });
  } catch (error) {
    console.error('Get latest version error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin phiên bản',
      error: error.message,
    });
  }
};

/**
 * PUT /api/app-version/update
 * Cập nhật thông tin version (Admin only)
 */
exports.updateVersionInfo = async (req, res) => {
  try {
    const {
      appType,
      latestVersion,
      minRequiredVersion,
      forceUpdate,
      updateMessage,
      features,
    } = req.body;

    if (!APP_VERSIONS[appType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid app type',
      });
    }

    // Cập nhật thông tin version (trong production nên lưu vào DB)
    if (latestVersion) APP_VERSIONS[appType].latestVersion = latestVersion;
    if (minRequiredVersion)
      APP_VERSIONS[appType].minRequiredVersion = minRequiredVersion;
    if (forceUpdate !== undefined)
      APP_VERSIONS[appType].forceUpdate = forceUpdate;
    if (updateMessage) APP_VERSIONS[appType].updateMessage = updateMessage;
    if (features) APP_VERSIONS[appType].features = features;

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin version',
      data: APP_VERSIONS[appType],
    });
  } catch (error) {
    console.error('Update version info error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin version',
      error: error.message,
    });
  }
};

/**
 * So sánh 2 version strings
 * @param {string} v1 - Version 1 (e.g., "1.1.4")
 * @param {string} v2 - Version 2 (e.g., "1.2.0")
 * @returns {number} - -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;

  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}
