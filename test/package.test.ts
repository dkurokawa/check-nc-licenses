import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

describe('Package Quality Assurance', () => {
  describe('Security and Privacy', () => {
    it('should not contain personal information or credentials', () => {
      // Keywords that might indicate personal info or credentials
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /api[_-]?key/i,
        /private[_-]?key/i,
        /credential/i,
        /auth[_-]?token/i,
        /access[_-]?token/i,
        /@gmail\.com/i,
        /@yahoo\.com/i,
        /@hotmail\.com/i,
        /your[_-]?username/i,
        /your[_-]?name/i,
        /your[_-]?email/i,
        /<.*@.*>/i, // Email placeholder patterns
      ]

      const filesToCheck = [
        'package.json',
        'README.md',
        'src/index.ts',
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts'
      ]

      for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          for (const pattern of sensitivePatterns) {
            expect(content).not.toMatch(pattern)
          }
        }
      }
    })

    it('should not contain absolute local paths', () => {
      const localPathPatterns = [
        /\/Users\/[^/]+/,
        /\/home\/[^/]+/,
        /C:\\Users\\/i,
        /\/tmp\/[^/]+/,
        /\/var\/[^/]+/,
      ]

      const filesToCheck = [
        'package.json',
        'README.md',
        'src/index.ts',
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts'
      ]

      for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          for (const pattern of localPathPatterns) {
            expect(content).not.toMatch(pattern)
          }
        }
      }
    })

    it('should not contain TODO or FIXME comments in production code', () => {
      const todoPatterns = [
        /TODO/i,
        /FIXME/i,
        /XXX/i,
        /HACK/i,
      ]

      const productionFiles = [
        'src/index.ts',
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts'
      ]

      for (const file of productionFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          for (const pattern of todoPatterns) {
            expect(content).not.toMatch(pattern)
          }
        }
      }
    })
  })

  describe('Package Structure', () => {
    it('should have proper package.json structure', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      
      // Required fields
      expect(packageJson.name).toBeDefined()
      expect(packageJson.version).toBeDefined()
      expect(packageJson.description).toBeDefined()
      expect(packageJson.main).toBeDefined()
      expect(packageJson.bin).toBeDefined()
      expect(packageJson.scripts).toBeDefined()
      expect(packageJson.keywords).toBeDefined()
      expect(packageJson.author).toBeDefined()
      expect(packageJson.license).toBeDefined()
      expect(packageJson.repository).toBeDefined()

      // Version should be semantic versioning
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+/)
      
      // Name should be valid npm package name
      expect(packageJson.name).toMatch(/^[a-z0-9-]+$/)
      
      // License should be valid
      expect(packageJson.license).toBe('MIT')
    })

    it('should have all required files', () => {
      const requiredFiles = [
        'README.md',
        'LICENSE',
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts',
        'src/types/filter.d.ts'
      ]

      for (const file of requiredFiles) {
        expect(fs.existsSync(file), `Required file ${file} should exist`).toBe(true)
        expect(fs.statSync(file).size, `Required file ${file} should not be empty`).toBeGreaterThan(0)
      }
    })

    it('should not have unnecessary files in project root', () => {
      const unnecessaryFiles = [
        'test.js',
        'index.js',
        'filter.js',
        'default-filter.js',
        'spdx-filter.js',
        '.DS_Store',
        'Thumbs.db',
        'desktop.ini'
      ]

      for (const file of unnecessaryFiles) {
        expect(fs.existsSync(file), `Unnecessary file ${file} should not exist`).toBe(false)
      }
    })

    it('should have proper TypeScript configuration', () => {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'))
      
      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.outDir).toBe('dist')
      expect(tsconfig.compilerOptions.strict).toBe(true)
      expect(tsconfig.include).toContain('src')
      expect(tsconfig.exclude).toContain('node_modules')
    })
  })

  describe('Build and CLI', () => {
    it('should build successfully', () => {
      expect(() => {
        execSync('npm run build', { stdio: 'pipe' })
      }).not.toThrow()

      // Check built files exist
      expect(fs.existsSync('dist/index.js')).toBe(true)
      expect(fs.existsSync('dist/filters/default-filter.js')).toBe(true)
      expect(fs.existsSync('dist/filters/spdx-filter.js')).toBe(true)
    })

    it('should have working CLI', () => {
      // Build first
      execSync('npm run build', { stdio: 'pipe' })
      
      expect(() => {
        const output = execSync('node dist/index.js --help', { encoding: 'utf-8' })
        expect(output).toContain('Usage:')
      }).not.toThrow()

      expect(() => {
        const output = execSync('node dist/index.js --version', { encoding: 'utf-8' })
        expect(output).toMatch(/\d+\.\d+\.\d+/)
      }).not.toThrow()
    })

    it('should have proper npm package contents', () => {
      const packageOutput = execSync('npm pack --dry-run 2>&1', { encoding: 'utf-8' })
      
      // Should include necessary files
      expect(packageOutput).toContain('LICENSE')
      expect(packageOutput).toContain('README.md')
      expect(packageOutput).toContain('package.json')
      expect(packageOutput).toContain('dist/index.js')
      expect(packageOutput).toContain('dist/filters/default-filter.js')
      expect(packageOutput).toContain('dist/filters/spdx-filter.js')
      
      // Should not include unnecessary files
      expect(packageOutput).not.toContain('test/')
      expect(packageOutput).not.toContain('tsconfig.json')
      expect(packageOutput).not.toContain('.git')
      expect(packageOutput).not.toContain('node_modules')
      expect(packageOutput).not.toContain('src/')
      
      // Check package size is reasonable (not too large)
      const sizeMatch = packageOutput.match(/package size:\s*([\d.]+)\s*([kK]?B)/)
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1])
        const unit = sizeMatch[2].toLowerCase()
        
        if (unit === 'kb') {
          expect(size).toBeLessThan(100) // Should be less than 100KB
        } else if (unit === 'b') {
          expect(size).toBeLessThan(100000) // Should be less than 100KB in bytes
        }
      }
      
      // Should have reasonable number of files
      const filesMatch = packageOutput.match(/total files:\s*(\d+)/)
      if (filesMatch) {
        const fileCount = parseInt(filesMatch[1])
        expect(fileCount).toBeGreaterThan(3) // At least package.json, README, LICENSE, main file
        expect(fileCount).toBeLessThan(20) // Not too many files
      }
    })
  })

  describe('Documentation', () => {
    it('should have proper README structure', () => {
      const readme = fs.readFileSync('README.md', 'utf-8')
      
      expect(readme).toContain('# check-nc-licenses')
      expect(readme).toContain('## Installation')
      expect(readme).toContain('## Usage')
      expect(readme).toContain('## License')
      
      // Should not contain placeholder text
      expect(readme).not.toContain('TODO')
      expect(readme).not.toContain('FIXME')
      expect(readme).not.toContain('your-username')
      expect(readme).not.toContain('Your Name')
    })

    it('should have valid LICENSE file', () => {
      const license = fs.readFileSync('LICENSE', 'utf-8')
      
      expect(license).toContain('MIT License')
      expect(license).toContain('Daisuke Kurokawa')
      expect(license).toMatch(/Copyright \(c\) \d{4}/)
    })
  })

  describe('Code Quality', () => {
    it('should not have console.log in production code', () => {
      const productionFiles = [
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts'
      ]

      for (const file of productionFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          // Allow console.error but not console.log in production filters
          expect(content).not.toMatch(/console\.log/)
          expect(content).not.toMatch(/console\.debug/)
        }
      }
    })

    it('should have proper TypeScript types', () => {
      const filterTypes = fs.readFileSync('src/types/filter.d.ts', 'utf-8')
      
      expect(filterTypes).toContain('export interface LicenseFilter')
      expect(filterTypes).toContain('export interface LicenseMatchResult')
    })

    it('should not have unused imports or variables', () => {
      // This is a basic check - in a real project you might use ESLint
      const srcFiles = [
        'src/index.ts',
        'src/filters/default-filter.ts',
        'src/filters/spdx-filter.ts'
      ]

      for (const file of srcFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          
          // Check for common unused import patterns
          expect(content).not.toMatch(/import.*from.*;\s*\/\/.*unused/)
          expect(content).not.toMatch(/const.*=.*;\s*\/\/.*unused/)
        }
      }
    })
  })
})
