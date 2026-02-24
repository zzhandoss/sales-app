import { IdentityDirectoryService } from '../../modules/identity/services/identity-directory.service';
import { AccessTokenService } from '../../modules/identity/services/access-token.service';
import { IdentityPublicUser } from '../../modules/identity/entities/identity-user.entity';

export interface LoginInput {
  tenantId: string;
  userId: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  expiresAt: string;
  user: IdentityPublicUser;
}

export class LoginUseCase {
  constructor(
    private readonly identityDirectoryService: IdentityDirectoryService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  execute(input: LoginInput): LoginResult {
    const user = this.identityDirectoryService.authenticate(input.tenantId, input.userId, input.password);
    const token = this.accessTokenService.issueToken({
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
    });

    return {
      accessToken: token.accessToken,
      expiresAt: token.expiresAt,
      user,
    };
  }
}
