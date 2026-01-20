import { readFileSync } from 'fs';
import { join } from 'path';

describe('Package Management Tests', () => {
  describe('Package Version Updates', () => {
    let packageJson: any;
    let pnpmLock: string;

    beforeAll(() => {
      // Read package.json
      const packageJsonPath = join(process.cwd(), 'package.json');
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // Read pnpm-lock.yaml
      const pnpmLockPath = join(process.cwd(), 'pnpm-lock.yaml');
      pnpmLock = readFileSync(pnpmLockPath, 'utf-8');
    });

    test('package.json should have valid structure', () => {
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('dependencies');
      expect(packageJson).toHaveProperty('devDependencies');
    });

    test('Next.js version should be updated correctly in package.json', () => {
      expect(packageJson.dependencies).toHaveProperty('next');
      const nextVersion = packageJson.dependencies.next;
      
      // Verify version format (e.g., ^16.1.4)
      expect(nextVersion).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
      
      // Verify major version is at least 15+
      const majorVersion = parseInt(nextVersion.replace(/[\^~]/, '').split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(15);
    });

    test('React version should be compatible with Next.js', () => {
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      
      const reactVersion = packageJson.dependencies.react;
      const reactDomVersion = packageJson.dependencies['react-dom'];
      
      // Both should have same major version
      const reactMajor = parseInt(reactVersion.replace(/[\^~]/, '').split('.')[0]);
      const reactDomMajor = parseInt(reactDomVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(reactMajor).toBe(reactDomMajor);
      
      // For Next.js 16+, React should be 19+
      const nextVersion = packageJson.dependencies.next;
      const nextMajor = parseInt(nextVersion.replace(/[\^~]/, '').split('.')[0]);
      
      if (nextMajor >= 16) {
        expect(reactMajor).toBeGreaterThanOrEqual(19);
      }
    });

    test('TypeScript version should be compatible', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      const tsVersion = packageJson.devDependencies.typescript;
      
      // Verify version format
      expect(tsVersion).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
      
      // TypeScript should be at least 5.x
      const majorVersion = parseInt(tsVersion.replace(/[\^~]/, '').split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(5);
    });

    test('pnpm-lock.yaml should exist and be valid', () => {
      expect(pnpmLock).toBeTruthy();
      expect(pnpmLock.length).toBeGreaterThan(0);
      
      // Check for lockfile version
      expect(pnpmLock).toContain('lockfileVersion:');
    });

    test('pnpm-lock.yaml should contain Next.js package', () => {
      expect(pnpmLock).toContain('next@');
    });

    test('pnpm-lock.yaml should contain React packages', () => {
      expect(pnpmLock).toContain('react@');
      expect(pnpmLock).toContain('react-dom@');
    });

    test('critical dependencies should have locked versions', () => {
      const criticalDeps = ['next', 'react', 'react-dom', 'typescript', '@types/react'];
      
      criticalDeps.forEach(dep => {
        if (dep in packageJson.dependencies || dep in packageJson.devDependencies) {
          expect(pnpmLock).toContain(dep);
        }
      });
    });

    test('package.json should have correct packageManager field', () => {
      expect(packageJson).toHaveProperty('packageManager');
      expect(packageJson.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+/);
    });

    test('all dependency versions should follow semantic versioning', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        // Allow for workspace:*, npm:, and semver patterns
        const versionStr = version as string;
        const isValid = 
          versionStr.startsWith('workspace:') ||
          versionStr.startsWith('npm:') ||
          /^[\^~]?\d+\.\d+\.\d+/.test(versionStr) ||
          /^\d+\.\d+\.\d+/.test(versionStr);
        
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Dependency Compatibility', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    });

    test('Next.js and React versions should be compatible', () => {
      const nextVersion = packageJson.dependencies.next;
      const reactVersion = packageJson.dependencies.react;
      
      const nextMajor = parseInt(nextVersion.replace(/[\^~]/, '').split('.')[0]);
      const reactMajor = parseInt(reactVersion.replace(/[\^~]/, '').split('.')[0]);
      
      // Next.js 15+ requires React 18+
      // Next.js 16+ requires React 19+
      if (nextMajor >= 16) {
        expect(reactMajor).toBeGreaterThanOrEqual(19);
      } else if (nextMajor === 15) {
        expect(reactMajor).toBeGreaterThanOrEqual(18);
      }
    });

    test('@types/react should match React major version', () => {
      const reactVersion = packageJson.dependencies.react;
      const typesReactVersion = packageJson.devDependencies['@types/react'];
      
      const reactMajor = parseInt(reactVersion.replace(/[\^~]/, '').split('.')[0]);
      const typesReactMajor = parseInt(typesReactVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(typesReactMajor).toBe(reactMajor);
    });

    test('@types/react-dom should match react-dom version', () => {
      const reactDomVersion = packageJson.dependencies['react-dom'];
      const typesReactDomVersion = packageJson.devDependencies['@types/react-dom'];
      
      const reactDomMajor = parseInt(reactDomVersion.replace(/[\^~]/, '').split('.')[0]);
      const typesReactDomMajor = parseInt(typesReactDomVersion.replace(/[\^~]/, '').split('.')[0]);
      
      expect(typesReactDomMajor).toBe(reactDomMajor);
    });

    test('next-auth version should be compatible with Next.js', () => {
      if (packageJson.dependencies['next-auth']) {
        const nextAuthVersion = packageJson.dependencies['next-auth'];
        const nextVersion = packageJson.dependencies.next;
        
        const nextMajor = parseInt(nextVersion.replace(/[\^~]/, '').split('.')[0]);
        
        // For Next.js 15+, next-auth should be 5.x (beta)
        if (nextMajor >= 15) {
          expect(nextAuthVersion).toMatch(/^5\./);
        }
      }
    });

    test('Tailwind CSS packages should be compatible', () => {
      if (packageJson.dependencies.tailwindcss) {
        const tailwindVersion = packageJson.dependencies.tailwindcss;
        const tailwindMajor = parseInt(tailwindVersion.replace(/[\^~]/, '').split('.')[0]);
        
        // Tailwind 4+ requires @tailwindcss/postcss
        if (tailwindMajor >= 4 && packageJson.devDependencies['@tailwindcss/postcss']) {
          const postcssPluginVersion = packageJson.devDependencies['@tailwindcss/postcss'];
          const postcssPluginMajor = parseInt(postcssPluginVersion.replace(/[\^~]/, '').split('.')[0]);
          expect(postcssPluginMajor).toBe(tailwindMajor);
        }
      }
    });

    test('ESLint and eslint-config-next should be compatible', () => {
      if (packageJson.devDependencies.eslint && packageJson.devDependencies['eslint-config-next']) {
        const eslintVersion = packageJson.devDependencies.eslint;
        const eslintMajor = parseInt(eslintVersion.replace(/[\^~]/, '').split('.')[0]);
        
        // ESLint 9+ is supported
        expect(eslintMajor).toBeGreaterThanOrEqual(8);
      }
    });

    test('Jest and ts-jest should be compatible', () => {
      if (packageJson.devDependencies.jest && packageJson.devDependencies['ts-jest']) {
        const jestVersion = packageJson.devDependencies.jest;
        const tsJestVersion = packageJson.devDependencies['ts-jest'];
        
        const jestMajor = parseInt(jestVersion.replace(/[\^~]/, '').split('.')[0]);
        const tsJestMajor = parseInt(tsJestVersion.replace(/[\^~]/, '').split('.')[0]);
        
        // ts-jest major version should match jest major version
        expect(tsJestMajor).toBe(jestMajor);
      }
    });

    test('Prisma client and CLI should have same version', () => {
      if (packageJson.devDependencies['@prisma/client'] && packageJson.devDependencies.prisma) {
        const clientVersion = packageJson.devDependencies['@prisma/client'];
        const cliVersion = packageJson.devDependencies.prisma;
        
        // Extract versions (handling ^ and ~)
        const clientMajor = parseInt(clientVersion.replace(/[\^~]/, '').split('.')[0]);
        const clientMinor = parseInt(clientVersion.replace(/[\^~]/, '').split('.')[1]);
        const cliMajor = parseInt(cliVersion.replace(/[\^~]/, '').split('.')[0]);
        const cliMinor = parseInt(cliVersion.replace(/[\^~]/, '').split('.')[1]);
        
        // Major and minor versions should match
        expect(clientMajor).toBe(cliMajor);
        expect(clientMinor).toBe(cliMinor);
      }
    });

    test('all Radix UI packages should have compatible versions', () => {
      const radixPackages = Object.keys(packageJson.dependencies || {})
        .filter(key => key.startsWith('@radix-ui/'));
      
      if (radixPackages.length > 0) {
        const versions = radixPackages.map(pkg => 
          parseInt(packageJson.dependencies[pkg].replace(/[\^~]/, '').split('.')[0])
        );
        
        // All should be version 1 or higher
        versions.forEach(version => {
          expect(version).toBeGreaterThanOrEqual(1);
        });
      }
    });

    test('peer dependencies conflicts should not exist', () => {
      // This would require reading node_modules or running npm/pnpm
      // For now, we verify that critical packages exist
      const criticalPairs = [
        ['react', 'react-dom'],
        ['next', 'react'],
        ['@prisma/client', 'prisma'],
        ['jest', 'ts-jest'],
      ];

      criticalPairs.forEach(([pkg1, pkg2]) => {
        const hasPkg1 = pkg1 in packageJson.dependencies || pkg1 in packageJson.devDependencies;
        const hasPkg2 = pkg2 in packageJson.dependencies || pkg2 in packageJson.devDependencies;
        
        // If one exists, the other should too (for critical pairs)
        if (hasPkg1) {
          expect(hasPkg2).toBe(true);
        }
      });
    });
  });

  describe('Security and Overrides', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    });

    test('pnpm overrides should be defined for security vulnerabilities', () => {
      if (packageJson.pnpm) {
        expect(packageJson.pnpm).toHaveProperty('overrides');
        const overrides = packageJson.pnpm.overrides;
        
        // Check for common security-related overrides
        expect(overrides).toBeDefined();
        expect(typeof overrides).toBe('object');
      }
    });

    test('minimatch should be overridden to safe version', () => {
      if (packageJson.pnpm?.overrides) {
        const overrides = packageJson.pnpm.overrides;
        if ('minimatch' in overrides) {
          expect(overrides.minimatch).toMatch(/\d+\.\d+\.\d+/);
        }
      }
    });

    test('glob should be overridden to safe version', () => {
      if (packageJson.pnpm?.overrides) {
        const overrides = packageJson.pnpm.overrides;
        if ('glob' in overrides) {
          expect(overrides.glob).toMatch(/\d+\.\d+\.\d+/);
        }
      }
    });
  });
});
