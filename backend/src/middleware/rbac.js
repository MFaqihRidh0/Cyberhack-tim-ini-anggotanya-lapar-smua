const ROLE_HIERARCHY = ['OPERATOR', 'QC_STAFF', 'PPIC', 'MANAGER'];

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'Tidak terautentikasi' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, data: null, message: 'Akses ditolak: role tidak sesuai' });
    }
    next();
  };
}

function allowRolesAndAbove(minRole) {
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'Tidak terautentikasi' });
    }
    const userIndex = ROLE_HIERARCHY.indexOf(req.user.role);
    if (userIndex < minIndex) {
      return res.status(403).json({ success: false, data: null, message: 'Akses ditolak: role tidak mencukupi' });
    }
    next();
  };
}

module.exports = { allowRoles, allowRolesAndAbove };
