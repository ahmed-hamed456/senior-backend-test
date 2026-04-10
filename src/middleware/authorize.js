/**
 * Role-based access control middleware factory.
 * Call with one or more allowed roles: authorize('admin', 'brand')
 * Returns 403 if the authenticated user's role is not in the list.
 */
export default function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: 'Forbidden: insufficient role', code: 403 });
    }
    next();
  };
}
